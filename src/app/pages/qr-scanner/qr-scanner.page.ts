import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoadingController, NavController } from '@ionic/angular';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Router } from '@angular/router';

import { PurchasesService } from '../../services/purchases.service';
import { FiatWalletsService } from '../../services/fiat-wallets.service';
import { CurrencyService } from '../../services/currency.service';
import { NotificationsService } from '../../services/notifications.service';
import { DepositService } from '../../services/deposit.service';
import { WithdrawalService } from '../../services/withdrawal.service';
import { Globals } from '../../services/globals.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.page.html',
  styleUrls: ['./qr-scanner.page.scss'],
})
export class QrScannerPage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  public confirmToken: string;
  public displayWrongText: boolean;
  public currencies: any;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private barcodeScanner: BarcodeScanner,
    private currencyService: CurrencyService,
    private fiatWalletsService: FiatWalletsService,
    private purchasesService: PurchasesService,
    private depositService: DepositService,
    private withdrawalService: WithdrawalService,
    private loadingCtrl: LoadingController,
    private notifications: NotificationsService,
    private storage: NativeStorage,
    private globals: Globals,
    private translate: TranslateService,
  ) {
    this.translate.setDefaultLang(this.globals.language);
  }

  ngOnInit() {
    this.getCurrencies();

    this.scanCode();
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public scanCode() {
    this.barcodeScanner
      .scan()
      .then(async barcodeData => {
        let currentCurrencyCode, currentCurrencyType;

        try {
          await this.storage.getItem('token');
        } catch (error) {
          return this.router.navigate(['/sign-in']);
        }

        let isBlockChain = false;

        this.currencies.forEach(currency => {
          const currencyCode =
            currency.code.toLowerCase() ===
            barcodeData.text.split(':')[0].toLowerCase();
          const currencyName =
            currency.name.toLowerCase() ===
            barcodeData.text.split(':')[0].toLowerCase();

          if (currencyCode || currencyName) {
            isBlockChain = true;
            currentCurrencyCode = currency.code;
            currentCurrencyType = currency.type;
          }
        });

        const qrCodeIdentifier = isBlockChain
          ? 'internal'
          : barcodeData.text.split(':')[0];

        switch (qrCodeIdentifier) {
          case 'internal':
            // Open send coins with credentials from parsed string
            const scannedAddress = barcodeData.text.split(':')[1].split('?')[0]
              ? barcodeData.text.split(':')[1].split('?')[0]
              : '';
            const scannedAmount = barcodeData.text.includes('amount=')
              ? barcodeData.text.split('amount=')[1].split('&')[0]
              : '';

            const parsedData = {
              currency: currentCurrencyCode,
              address: scannedAddress,
              amount: scannedAmount,
            };
            
            if (currentCurrencyType === 'crypto' || currentCurrencyType.includes('erc')) {
              this.router.navigate([
                '/smart-crypto-transaction',
                { data: JSON.stringify(parsedData) },
              ]);
            } else if (currentCurrencyType === 'fiat') {
              const fiatData = {
                currencyCode: currentCurrencyCode,
                toAddress: scannedAddress,
                amount: scannedAmount,
                recipientAccounts: null,
                recipientName: null,
              };

              const loading = await this.loadingCtrl.create({
                spinner: 'crescent',
              });
              await loading.present();

              const subFindAccount = this.fiatWalletsService
                .findEcosystemAccounts(
                  fiatData.toAddress,
                  fiatData.currencyCode,
                )
                .subscribe(
                  async (res: any) => {
                    fiatData.recipientAccounts = res.data.accounts;
                    fiatData.recipientName = res.data.receiver;
                    await loading.dismiss();
                    this.router.navigate([
                      '/ecosystem-transaction',
                      { data: JSON.stringify(fiatData) },
                    ]);
                  },
                  (thrown: any) => {
                    this.notifications.showNotification(
                      thrown.error.message,
                      'error',
                      loading,
                    );
                  },
                );
              this.subs.push(subFindAccount);
            }
            break;

          case 'orphanPurchase':
            const verifyPurchaseToken = barcodeData.text.split(':')[1];

            if (verifyPurchaseToken.length === 0) {
              this.displayWrongText = true;
            }

            const loading = await this.loadingCtrl.create({
              spinner: 'crescent',
            });
            await loading.present();

            const subAssignPurchase = this.purchasesService
              .assignPurchase(verifyPurchaseToken)
              .subscribe(
                async (data: any) => {
                  this.confirmToken = data.token;
                  await loading.dismiss();
                  this.router.navigate([
                    '/confirm-purchase',
                    { token: this.confirmToken },
                  ]);
                },
                (thrown: any) => {
                  this.notifications.showNotification(
                    thrown.error.message,
                    'error',
                    loading,
                  );
                },
              );
            this.subs.push(subAssignPurchase);
            break;

          case 'purchaseIdentifier':
            const purchaseId = barcodeData.text.split(':')[1];
            this.router.navigate([
              '/purchase-details',
              { id: JSON.stringify(purchaseId) },
            ]);
            break;

          case 'deposit':
            const verifyDepositToken = barcodeData.text.split(':')[1];

            if (verifyDepositToken.length === 0) {
              this.displayWrongText = true;
              return;
            }

            const depositLoading = await this.loadingCtrl.create({
              spinner: 'crescent',
            });
            await depositLoading.present();

            const subDeposit = this.depositService
              .assignDeposit(verifyDepositToken)
              .subscribe(
                async (data: any) => {
                  this.confirmToken = data.token;
                  await depositLoading.dismiss();
                  this.router.navigate([
                    '/confirm-deposit',
                    { token: this.confirmToken },
                  ]);
                },
                async thrown => {
                  await this.notifications.showNotification(
                    thrown.error.message,
                    'error',
                    depositLoading,
                  );
                },
              );
            this.subs.push(subDeposit);
            break;

          case 'withdrawal':
            const verifyWithdrawalToken = barcodeData.text.split(':')[1];

            if (verifyWithdrawalToken.length === 0) {
              this.displayWrongText = true;
              return;
            }

            const withdrawalLoading = await this.loadingCtrl.create({
              spinner: 'crescent',
            });
            await withdrawalLoading.present();

            const subWithdrawal = this.withdrawalService
              .assignWithdrawal(verifyWithdrawalToken)
              .subscribe(
                async (data: any) => {
                  this.confirmToken = data.token;
                  await withdrawalLoading.dismiss();
                  this.router.navigate([
                    '/confirm-withdrawal',
                    { token: this.confirmToken },
                  ]);
                },
                async thrown => {
                  await this.notifications.showNotification(
                    thrown.error.message,
                    'error',
                    withdrawalLoading,
                  );
                },
              );
            this.subs.push(subWithdrawal);
            break;

          default:
            // It`s address - open send coins modal with address
            if (barcodeData.text.length === 0) {
              if (!barcodeData.cancelled) {
                this.displayWrongText = true;
                return;
              }
              this.displayWrongText = true;
              return;
            }
            const scanedData = {
              address: barcodeData.text,
              from: 'qr-scanner',
            };

            this.router.navigate([
              '/address-transaction',
              { data: JSON.stringify(scanedData) },
            ]);
            break;
        }
      })
      .catch((message: any) => {
        this.navCtrl.back();
        // this.notifications.showNotification(message, 'info');
      });
  }

  private getCurrencies() {
    const subGetCurr = this.currencyService.getCurrencies().subscribe(
      (data: any) => {
        this.currencies = data.data;
      },
      (thrown: any) => {
        this.notifications.showNotification(thrown.error.message, 'error');
      },
    );
    this.subs.push(subGetCurr);
  }

  public goBack() {
    this.navCtrl.back();
  }
}

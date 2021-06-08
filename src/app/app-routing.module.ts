import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IsAccountApprovedGuard } from './guards/is-account-approved.guard';
import { IsLoggedGuard } from './guards/is-logged.guard';
import { IsAuthentiticatedGuard } from './guards/is-authentiticated.guard';

const routes: Routes = [

  /**
   * Authentitication routes
   */
  {
    path: 'sign-in',
    loadChildren: './pages/authorization/sign-in/sign-in.module#SignInPageModule',
    canActivate: [IsLoggedGuard, IsAccountApprovedGuard]
  },
  {
    path: 'sign-up',
    loadChildren: './pages/authorization/sign-up/sign-up.module#SignUpPageModule',
    canActivate: [IsLoggedGuard]
  },
  {
    path: 'enter-password',
    loadChildren: './pages/authorization/enter-password/enter-password.module#EnterPasswordPageModule',
    canActivate: [IsLoggedGuard]
  },
  {
    path: 'forgot-password',
    loadChildren: './pages/authorization/forgot-password/forgot-password.module#ForgotPasswordPageModule',
    canActivate: [IsLoggedGuard]
  },
  {
    path: 'confirm-registration/:token',
    loadChildren: './pages/authorization/confirm-registration/confirm-registration.module#ConfirmRegistrationPageModule',
    canActivate: [IsLoggedGuard]
  },
  {
    path: 'reset-password/:token',
    loadChildren: './pages/authorization/reset-password/reset-password.module#ResetPasswordPageModule',
    canActivate: [IsLoggedGuard]
  },
  {
    path: 'verify',
    loadChildren: './pages/authorization/verify/verify.module#VerifyPageModule',
    canActivate: [IsLoggedGuard]
  },
  {
    path: 'verify/:code',
    loadChildren: './pages/authorization/verify/verify.module#VerifyPageModule',
    canActivate: [IsLoggedGuard]
  },
  {
    path: 'verify-by-face-recognition',
    loadChildren: './pages/authorization/verify-by-face-recognition/verify-by-face-recognition.module#VerifyByFaceRecognitionPageModule',
  },

  /**
   * Home component
   */
  {
    path: '',
    loadChildren: './pages/authorization/sign-in/sign-in.module#SignInPageModule',
    canActivate: [IsLoggedGuard, IsAccountApprovedGuard]
  },

  /**
   * Settings routes
   */
  {
    path: 'settings',
    loadChildren: './pages/settings/settings.module#SettingsPageModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'activity',
    loadChildren: './pages/settings/activity/activity.module#ActivityPageModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'change-notifications',
    loadChildren: './pages/settings/change-notifications/change-notifications.module#ChangeNotificationsPageModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'change-password',
    loadChildren: './pages/settings/change-password/change-password.module#ChangePasswordPageModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'change-type-of-verification',
    loadChildren: './pages/settings/change-type-of-verification/change-type-of-verification.module#ChangeTypeOfVerificationPageModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'fingerprint',
    loadChildren: './pages/settings/fingerprint/fingerprint.module#FingerprintPageModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'pin-code',
    loadChildren: './pages/settings/pin-code/pin-code.module#PinCodePageModule',
  },

  /**
   * Purchases routes
   */
  {
    path: 'cancel-purchase',
    loadChildren: './pages/purchase/cancel-purchase/cancel-purchase.module#CancelPurchasePageModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'confirm-purchase',
    loadChildren: './pages/purchase/confirm-purchase/confirm-purchase.module#ConfirmPurchasePageModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'success-purchase',
    loadChildren: './pages/purchase/success-purchase/success-purchase.module#SuccessPurchasePageModule',
    canActivate: [IsAuthentiticatedGuard]
  },

  /**
   * Application routes
   */
  {
    path: 'face-recognition',
    loadChildren: './pages/face-recognition/face-recognition.module#FaceRecognitionPageModule',
  },
  {
    path: 'confirm-face-recognition',
    loadChildren: './pages/face-recognition/confirm-face-recognition/confirm-face-recognition.module#ConfirmFaceRecognitionPageModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'qr-scanner',
    loadChildren: './pages/qr-scanner/qr-scanner.module#QrScannerPageModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'generate-crypto-wallet',
    loadChildren: './pages/modals/generate-crypto-wallet/generate-crypto-wallet.module#GenerateCryproWalletPageModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'rename-wallet',
    loadChildren: './pages/modals/rename-wallet/rename-wallet.module#RenameWalletPageModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'request-coins',
    loadChildren: './pages/modals/request-coins/request-coins.module#RequestCoinsPageModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'generate-crypto-transaction',
    loadChildren: './pages/modals/generate-crypto-transaction/generate-crypto-transaction.module#SendCoinsPageModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'smart-crypto-transaction',
    loadChildren: './pages/modals/smart-crypto-transaction/smart-crypto-transaction.module#SmartSendCoinsPageModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'address-transaction',
    loadChildren: './pages/modals/address-transaction/address-transaction.module#AddressTransactionModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'crypto-wallet-details',
    loadChildren: './pages/wallets/crypto-wallet-details/crypto-wallet-details.module#WalletDetailsPageModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'update-profile',
    loadChildren: './pages/modals/update-profile/update-profile.module#UpdateProfilePageModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'documents',
    loadChildren: './pages/modals/documents/documents.module#DocumentsPageModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'generate-fiat-wallet',
    loadChildren: './pages/modals/generate-fiat-wallet/generate-fiat-wallet.module#GenerateFiatWalletPageModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'fiat-wallet-details',
    loadChildren: './pages/wallets/fiat-wallet-details/fiat-wallet-details.module#IbanDetailsPageModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'sepa-transaction',
    loadChildren: './pages/modals/generate-fiat-transaction/sepa-transaction/sepa-transaction.module#SepaTransactionPageModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'swift-transaction',
    loadChildren: './pages/modals/generate-fiat-transaction/swift-transaction/swift-transaction.module#SwiftTransactionPageModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'ach-transaction',
    loadChildren: './pages/modals/generate-fiat-transaction/ach-transaction/ach-transaction.module#AchTransactionPageModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'chaps-transaction',
    loadChildren: './pages/modals/generate-fiat-transaction/chaps-transaction/chaps-transaction.module#ChapsTransactionPageModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'generate-fiat-transaction',
    loadChildren: './pages/modals/generate-fiat-transaction/generate-fiat-transaction.module#SendFiatCoinsPageModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'ecosystem-transaction',
    loadChildren: './pages/modals/generate-fiat-transaction/ecosystem-transaction/ecosystem-transaction.module#EcosystemTransactionPageModule',
    canActivate: [IsAuthentiticatedGuard]
  }, {
    path: 'wallets',
    loadChildren: './pages/wallets/wallets.module#WalletsPageModule',
    canActivate: [IsAuthentiticatedGuard]
  }, {
    path: 'transactions',
    loadChildren: './pages/transactions/transactions.module#TransactionsPageModule',
    canActivate: [IsAuthentiticatedGuard]
  }, {
    path: 'exchange',
    loadChildren: './pages/exchange/exchange.module#ExchangePageModule',
    canActivate: [IsAuthentiticatedGuard]
  }, {
    path: 'requests',
    loadChildren: './pages/requests/requests.module#RequestsPageModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'requisites',
    loadChildren: './pages/wallets/fiat-wallet-details/requisites/requisites.module#RequisitesPageModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'change-language',
    loadChildren: './pages/settings/change-language/change-language.module#ChangeLanguagePageModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'waiting-live-kyc',
    loadChildren: './pages/modals/waiting-live-kyc/waiting-live-kyc.module#WaitingLiveKycPageModule',
    canActivate: [IsAuthentiticatedGuard]
  },

  /**
   * Deposit routes
   */
  {
    path: 'cancel-deposit',
    loadChildren: './pages/deposit/cancel-deposit/cancel-deposit.module#CancelDepositPageModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'confirm-deposit',
    loadChildren: './pages/deposit/confirm-deposit/confirm-deposit.module#ConfirmDepositPageModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'success-deposit',
    loadChildren: './pages/deposit/success-deposit/success-deposit.module#SuccessDepositPageModule',
    canActivate: [IsAuthentiticatedGuard]
  },

  /**
   * Withdrawal routes
   */
  {
    path: 'cancel-withdrawal',
    loadChildren: './pages/withdrawal/cancel-withdrawal/cancel-withdrawal.module#CancelWithdrawalPageModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'confirm-withdrawal',
    loadChildren: './pages/withdrawal/confirm-withdrawal/confirm-withdrawal.module#ConfirmWithdrawalPageModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'success-withdrawal',
    loadChildren: './pages/withdrawal/success-withdrawal/success-withdrawal.module#SuccessWithdrawalPageModule',
    canActivate: [IsAuthentiticatedGuard]
  },

  {
    path: 'success-page',
    loadChildren: './shared/success-page/success-page.module#SuccessPageModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'cancel-page',
    loadChildren: './shared/cancel-page/cancel-page.module#CancelPageModule',
    canActivate: [IsAuthentiticatedGuard]
  },
  {
    path: 'selfie',
    loadChildren: './pages/modals/selfie/selfie.module#SelfiePageModule',
    canActivate: [IsAuthentiticatedGuard],
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }

import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpInterceptor,
  HttpHeaderResponse,
  HttpSentEvent,
  HttpProgressEvent,
  HttpResponse,
  HttpUserEvent,
  HttpErrorResponse
} from "@angular/common/http";
import { Observable, BehaviorSubject, throwError } from "rxjs";
import { catchError, switchMap, filter, take } from "rxjs/operators";
import { ApiService } from "./api.service";
import { LoadingController, ModalController } from '@ionic/angular';
import { NotificationsService } from './notifications.service';

@Injectable()
export class InterceptorService implements HttpInterceptor {
  private isRefreshingToken = false;
  private tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(
    null
  );

  constructor(
    private apiService: ApiService,
    private loadingCtrl: LoadingController,
    private notifications: NotificationsService,
    private modalCtrl: ModalController
  ) {}

  public intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<
    | HttpSentEvent
    | HttpHeaderResponse
    | HttpProgressEvent
    | HttpResponse<any>
    | HttpUserEvent<any>
    | any
  > {
    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse) {
          switch ((<HttpErrorResponse>error).status) {
            case 400: {
              this.handleLoading();
              this.notifications.showNotification(
                error.error.message,
                'error',
              );

              return throwError(error);
            }

            case 401: {
              this.handleLoading();
              return this.handle401Error(request, next);
            }
            case 403: {
              this.handleLoading();
              this.apiService.logout();

              return throwError(error);
            }
            default: {
              this.handleLoading();
              return throwError(error);
            }
          }
        } else {
          return throwError(error);
        }
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshingToken) {
      this.isRefreshingToken = true;

      this.tokenSubject.next(null);

      return this.apiService.refreshToken().pipe(
        switchMap((token: string) => {
          this.isRefreshingToken = false;
          this.tokenSubject.next(token);
          return next.handle(this.addTokenToRequest(request, token));
        }),
        catchError(async (error) => {
          this.isRefreshingToken = false;
          const modal = await this.modalCtrl.getTop();
          const loading = await this.loadingCtrl.getTop();

          if (modal) {
            await modal.dismiss();
          }

          if (loading) {
            await loading.dismiss();
          }

          this.apiService.logout();

          return throwError(error);
        })
      );
    } else {
      return this.tokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap((token: string) => {
          return next.handle(this.addTokenToRequest(request, token));
        })
      );
    }
  }

  private addTokenToRequest(
    request: HttpRequest<any>,
    token: string
  ): HttpRequest<any> {
    return request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  private async handleLoading() {
    const loading = await this.loadingCtrl.getTop();
    if (loading) {
      await loading.dismiss();
    }
  }
}

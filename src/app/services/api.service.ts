import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { NativeStorage } from "@ionic-native/native-storage/ngx";
import { environment } from "../../environments/environment";

import { map, mergeMap, catchError } from "rxjs/operators";
import { Observable, from, forkJoin } from "rxjs";

@Injectable({
  providedIn: "root"
})

export class ApiService {
  private platformOrientation: string;
  private platformOrientationVersion: string;

  constructor(
    private http: HttpClient,
    private storage: NativeStorage,
    private router: Router
  ) {
    this.platformOrientation =
      environment.LABEL_CONFIGS[environment.WHITE_LABEL_PLATFORM].platformToken;
    this.platformOrientationVersion =
      environment.LABEL_CONFIGS[environment.WHITE_LABEL_PLATFORM].version;
  }

  public refreshToken(): Observable<any> {
    const headers = {
      headers: new HttpHeaders()
        .append("X-Platform-Orientation", this.platformOrientation)
        .append("X-Platform-Orientation-Version", this.platformOrientationVersion)
    };

    return from(this.storage.getItem("token")).pipe(
      mergeMap(token => {
        return this.http.post(
          `${environment.API_URL}/refresh-token`,
          JSON.stringify({ token }),
          headers
        );
      }),
      mergeMap((res: any) => {
        return forkJoin([
          from(this.storage.setItem("token", res.data.token)),
          from(this.storage.setItem("expire_at", res.data.expiration)),
          from(res.data.token)
        ]);
      }),
      map(result => {
        return result[0];
      })
    );
  }

  public executeRequest(method: string, url: string, body?, checkAuth: boolean = true) {
    return this.getOptions(body, checkAuth).pipe(
      mergeMap((options) =>
        this.http.request(
          method.toUpperCase(),
          `${environment.API_URL}${url}`,
          options
        )
      ), catchError((error) => {
        throw error;
      })
    );
  }

  public async logout() {
    await this.storage.remove("token");
    await this.storage.remove("expire_at");

    this.router.navigate([`/sign-in`]);
  }

  private async getTokenFromStorage() {
    try {
      const token = await this.storage.getItem("token");
      return `Bearer ${token}`;
    } catch {}
  }

  private getOptions(body, checkAuth): Observable<{ body: any; headers: HttpHeaders }> {
    const options = {
      body: body,
      headers: new HttpHeaders()
    };

    options.headers = options.headers
      .append("X-Platform-Orientation", this.platformOrientation)
      .append(
        "X-Platform-Orientation-Version",
        this.platformOrientationVersion
      );
      
    return this.getAuthHeader().pipe(
      map(token => {
        if (checkAuth) {
          options.headers = options.headers.append("Authorization", token);
        }
        return options;
      })
    );
  }

  private getAuthHeader() {
    return from(this.getTokenFromStorage());
  }
}

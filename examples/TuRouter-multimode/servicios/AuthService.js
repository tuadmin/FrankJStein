import { IAuthService } from "../contratos.js";
export class AuthService extends IAuthService {
    constructor(onStateChange) {
        super();
        this.isLoggedIn = false;
        this.username = "";
        this.onStateChange = onStateChange;
    }
    login(username) {
        this.isLoggedIn = username || "Invitado";
        this.username = username;
        this.onStateChange();
    }
    logout() {
        this.isLoggedIn = false;
        this.username = "";
        this.onStateChange();
    }
}

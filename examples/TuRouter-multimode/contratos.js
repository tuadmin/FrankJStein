export class IAuthService {
    isLoggedIn = false;
    username = false;
    onStateChange = () => null;
    login(username) {
        throw new Error("Not implemented");
    }
    logout() {
        throw new Error("Not implemented");
    }
}

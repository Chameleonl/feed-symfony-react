export default function getGuestToken() {
	let token = localStorage.getItem("guestToken");
	if (!token) {
		token = Math.random().toString(36).slice(2, 9);
		localStorage.setItem("guestToken", token);
	}

	return token;
}

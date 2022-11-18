const dialog = document.querySelector("dialog");
const dialogTitle = document.querySelector("dialog h2");
const dialogText = document.querySelector("dialog p");
const closeDialog = () => dialog.close();

const handleSubmit = (e) => {
	e.preventDefault();
	const files = document.querySelector('input[type="file"]');
	const token = document.querySelector("textarea").value.trim();

	if (!files.files[0]) {
		dialogTitle.textContent = "Error";
		dialogText.textContent = "Please select a file.";
		dialog.showModal();
		return;
	}
	if (!token) {
		dialogTitle.textContent = "Error";
		dialogText.textContent = "Please enter a token.";
		dialog.showModal();
		return;
	}

	const formData = new FormData();
	formData.append("file", files.files[0]);

	const headers = new Headers();
	headers.append("Authorization", `Bearer ${token}`);

	fetch("/", {
		headers,
		method: "POST",
		body: formData,
	})
		.then((res) => res.json())
		.then((res) => {
			if (res.status === 500) {
				dialogTitle.textContent = "Error";
				dialogText.textContent = "Internal server error.";
			} else if (res.status === 413) {
				dialogTitle.textContent = "Error";
				dialogText.textContent = "File too large.";
			} else if (res.status === 401 || res.status === 403) {
				dialogTitle.textContent = "Error";
				dialogText.textContent = "Invalid token.";
			} else if (res.status === 400) {
				dialogTitle.textContent = "Error";
				dialogText.textContent = "Invalid file / No file selected.";
			} else {
				dialogTitle.textContent = "Success";
				dialogText.innerHTML = `<p>Your file is available at:</p>
				<p><a href="${res.link}" target="_blank" rel="noreferrer noopener">${res.link}</a></p>`;
			}
			dialog.showModal();
		})
		.catch((err) => {
			console.log(err);
		});
};

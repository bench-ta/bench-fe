document.getElementById('logout-button').addEventListener('click', logout);

    function logout() {
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('fullname');
        localStorage.removeItem('email');

        // Clear cookies
        function deleteAllCookies() {
            const cookies = document.cookie.split(";");

            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i];
                const eqPos = cookie.indexOf("=");
                const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
            }
        }

        deleteAllCookies();

        // Redirect to login page
        window.location.href = '../index.html';
    }
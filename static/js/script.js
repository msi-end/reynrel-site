console.log('i am connected');

function openNavBar() {
    document.getElementById('mobile-navbar').style.display = 'flex';
    document.body.classList.add('no-scroll');
}


function closeNavBar() {
    document.getElementById('mobile-navbar').style.display = 'none';
    document.body.classList.remove('no-scroll');
}
function hello() {
    if (new Date().getTime() % 2 === 0) {
        return 'ciao';
    } else {
        return 'hallo';
    }
}

console.log('yay ' + hello());
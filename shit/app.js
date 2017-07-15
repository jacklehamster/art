requirejs.config({
    // enforceDefine: true,
//    baseUrl: 'http://localhost/~vincent/dok',
    paths: {
        threejs: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/85/three.min',
        dobuki: 'https://jacklehamster.github.io/dok/out/dok.min',
//        dobuki: 'http://localhost/~vincent/dok/dobuki',
    },
    urlArgs: (location.search.match(/\bdebug\b|\bdisable_cache\b/g)) ? "time=" + Date.now() : '',
    catchError:false,
});

define(function() {
    requirejs(['main.js']);
});
angular.module('simon', ['ui.router', 'ngAudio'])
    .config(function($urlRouterProvider, $locationProvider, $stateProvider) {

        $locationProvider.html5Mode(false);

        // routes
        $stateProvider
            .state('init', {
                url: '/',
                templateUrl: 'home.html',
                controller: 'MainCtrl'
            });

        $urlRouterProvider.otherwise('/');

    }).controller('MainCtrl', MainCtrl);

MainCtrl.$inject = ['$scope', '$timeout', 'ngAudio'];
function MainCtrl($scope, $timeout, ngAudio) {
    var colors = ['red', 'green', 'blue', 'yellow'];
    var gamePool = [];
    var loop = 1;
    var allowInteracting = false;
    var sounds = {};
    var interval = 2000;
    $scope.steps = 1;
    $scope.isStrictMode = false;
    $scope.game = {activeColor: ''};
    $scope.press = press;
    $scope.release = release;
    $scope.start = start;
    $scope.toggleStrict = toggleStrict;

    // run
    loadSounds();

    function start() {
        reset();
        addColor();
        showButtons();
    }

    function press(color) {
        var timeout;
        if (!allowInteracting) {
            return;
        }

        highlightButton(color);
        if (gamePool[loop - 1] !== color) {
            allowInteracting = false;
            playErrorSound();

            timeout = $timeout(function () {
                clearHighlight();
            }, 500);

            if ($scope.isStrictMode) {
                reset();
                addColor();
            }

            $timeout(function () {
                $timeout.cancel(timeout);
                showButtons();
            }, 2000);
            return;
        }
        playSoundForButton(color);
        loop++;

        if (isNextRound()) {
            loop = 1;
            $scope.steps++;
            allowInteracting = false;

            // increment speed
            if ($scope.steps === 5 || $scope.steps === 9 || $scope.steps === 13) {
                interval -= 200;
            } else if ($scope.steps === 20) {
                victory();
                return;
            }

            $timeout(function () {
                addColor();
                showButtons();
            }, interval + 1000);
        }
    }

    function victory() {
        // 3 loops through buttons
        colors.concat(colors).concat(colors).forEach(function(color, index) {
            showSingleButton(color, index * 300);
        });
        // and then start over
        $timeout(function () {
            start();
        }, 300 * colors.length * 3 + 3000);
    }

    function release(color) {
        clearHighlight();
    }

    function toggleStrict() {
        $scope.isStrictMode = !$scope.isStrictMode;
        start();
    }

    function randomizeColor() {
        return colors[Math.floor(Math.random() * 4)];
    }

    function reset() {
        $scope.steps = 1;
        loop = 1;
        gamePool = [];
        interval = 2000;
    }

    function highlightButton(color) {
        $scope.game.activeColor = color;
    }

    function playSoundForButton(color) {
        sounds[color].play();
    }

    function playErrorSound() {
        sounds.error.play();
    }

    function clearHighlight() {
        $scope.game.activeColor = '';
    }

    function showButtons() {
        gamePool.forEach(function(color, index) {
            showSingleButton(color, index * interval);
        });

        $timeout(function () {
            allowInteracting = true;
        }, $scope.steps * interval);
    }

    function showSingleButton(color, timeout) {
        $timeout(function () {
            highlightButton(color);
            playSoundForButton(color);
        }, timeout);

        $timeout(function () {
            clearHighlight();
        }, timeout + 800);
    }

    function loadSounds() {
        sounds = {
            red: ngAudio.load('https://s3.amazonaws.com/freecodecamp/simonSound1.mp3'),
            green: ngAudio.load('https://s3.amazonaws.com/freecodecamp/simonSound2.mp3'),
            blue: ngAudio.load('https://s3.amazonaws.com/freecodecamp/simonSound3.mp3'),
            yellow: ngAudio.load('https://s3.amazonaws.com/freecodecamp/simonSound4.mp3'),
            error: ngAudio.load('http://www.myinstants.com/media/sounds/erro.mp3')
        };
    }

    function isNextRound() {
        return (loop > $scope.steps);
    }

    function addColor() {
        gamePool.push(randomizeColor());
    }
}
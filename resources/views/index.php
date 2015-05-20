<!DOCTYPE html>
<html ng-app="Sounderp">
<head>
    <title>Sounderp</title>
    <link href="/js/components/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet" />
    <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">
    <link href="/css/main.css" rel="stylesheet" />
</head>
<body ng-controller="AuthController">

    <div id="main-loader" ng-show="!authed">
        <i class="loading-icon fa fa-circle-o-notch fa-spin"></i>
    </div>

    <div class="container-fluid" ng-show="authed">
        <div class="col-md-8">
            <player></player>
            <online-users></online-users>
            <playlist></playlist>
        </div>
        <div class="col-md-4" id="search-pane">
            <search-pane></search-pane>
        </div>
    </div>

    <script type="text/javascript" src="/js/components/angular/angular.min.js"></script>
    <script type="text/javascript" src="/js/components/angular-cookies/angular-cookies.min.js"></script>
    <script type="text/javascript" src="/js/components/lodash/lodash.min.js"></script>
    <script type="text/javascript" src="/js/components/angular-spotify/dist/angular-spotify.min.js"></script>
    <script type="text/javascript" src="/js/components/angular-audio/app/angular.audio.js"></script>
    <script type="text/javascript" src="/js/components/firebase/firebase.js"></script>
    <script type="text/javascript" src="/js/components/moment/min/moment.min.js"></script>
    <script type="text/javascript" src="//connect.soundcloud.com/sdk.js"></script>
    <script type="text/javascript" src="/js/bundle.js"></script>
    <script type="text/javascript" src="/js/templates.js"></script>

</body>
</html>

<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

$app->get('/', function() use ($app) {
    return view('index');
});

$app->group(['prefix' => 'config'], function() use ($app) {
    $app->get('streaming', function() {
        return [
            'full_url' => 'http://' . env('ICECAST_URL') . ':' . env('ICECAST_PORT') . '/' . env('ICECAST_STREAM'),
        ];
    });

    $app->get('soundcloud', function() {
        return [
            'client_id' => env('SOUNDCLOUD_CLIENT'),
        ];
    });

    $app->get('spotify', function() {
        return [
            'client_id' => env('SPOTIFY_CLIENT'),
            'token'     => env('SPOTIFY_TOKEN'),
        ];
    });

    $app->get('firebase', function() {
        return [
            'url' => env('FIREBASE_URL'),
        ];
    });

    $app->get('youtube', function() {
        return [
            'key' => env('YOUTUBE_KEY'),
        ];
    });
});

$app->post('playlist', function() {
    $playlist = \Request::get('playlist');

    $data = [];

    foreach ($playlist as $item) {
        $data[] = 'annotate:title="'
                    . htmlentities($item['title']) . '",artist="'
                    . htmlentities(array_get($item, 'artist')) . '":'
                    . $item['url'];
    }

    file_put_contents(storage_path('playlist/dev.txt'), implode("\n", $data));
});

$app->group(['prefix' => 'track'], function() use ($app) {
    $app->post('process', 'App\Track\Processor@process');
});

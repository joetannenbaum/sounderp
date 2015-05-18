<?php namespace App\Console\Commands;

use Firebase\FirebaseLib as Firebase;
use GuzzleHttp\Client;
use Illuminate\Console\Command;

class UpdateCurrentlyPlayingCommand extends Command {

    /**
     * The console command name.
     *
     * @var string
     */
    protected $name = 'update:currently-playing';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update the currently playing track in Firebase';

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $start_time = time();

        while ((time() - $start_time) < 55) {
            $this->checkForNewTrack();
            sleep(3);
        }
    }

    protected function checkForNewTrack()
    {
        $this->info('Starting check...');
        $last_playing = \Cache::get('currently-playing');
        $client       = new Client;
        $response     = $client->get('http://' . env('ICECAST_URL') . ':' . env('ICECAST_PORT') . '/' . env('ICECAST_STREAM') . '.xspf');
        $title        = (string) $response->xml()->trackList->track->title;
        $title        = htmlspecialchars_decode($title);

        if ($title !== $last_playing) {
            $firebase = new Firebase(env('FIREBASE_URL'), env('FIREBASE_TOKEN'));
            $tracks   = json_decode($firebase->get('tracks'));

            foreach ($tracks as $key => $track) {
                if ($title === $track->artist . ' - ' . $track->title) {
                    $this->comment('Setting ' . $track->title . ' as currently playing (' . $key . ')');

                    $firebase->update('tracks/' . $key, [
                                                            'votes'       => [],
                                                            'last_played' => ['.sv' => 'timestamp']
                                                            'current'     => true,
                                                        ]);

                    \Cache::put('currently-playing', $title, 60);

                    break;
                } else {
                    $firebase->update('tracks/' . $key, [
                                                            'current'     => false,
                                                        ]);
                }
            }
        }
    }

}

<?php namespace App\Track;

use Firebase\FirebaseLib as Firebase;

class Processor {

    protected $tag_writer;

    protected $track;

    protected $artist;

    protected $firebase;

    public function __construct()
    {
        $this->firebase = new Firebase(env('FIREBASE_URL'), env('FIREBASE_TOKEN'));
        $this->initTagWriter();
    }

    public function process()
    {
        $firebase_id = \Request::get('key');

        $data       = json_decode($this->firebase->get('tracks/' . $firebase_id));
        $source_url = last($data->sources)->url;

        $filename = $this->getTrack($source_url);

        $this->tag_writer->filename = $filename;

        $tag_data = [
            'title'  => [$data->title],
            'artist' => [$data->artist],
        ];

        $this->tag_writer->tag_data = $tag_data;
        $this->tag_writer->WriteTags();

        $s3_path = 'audio/' . str_slug($data->artist . ' ' . $data->title) . '.ogg';

        \Storage::drive('s3')->put($s3_path, file_get_contents($filename), 'public');

        unlink($filename);

        $firebase_update = [
            'url'    => env('S3_WEB_URL') . '/' . $s3_path,
            'status' => 'playable',
        ];

        $this->firebase->update('tracks/' . $firebase_id, $firebase_update);

        return [
            'success' => true,
        ];
    }

    protected function getTrack($url)
    {
        $path = storage_path('tracks/%(extractor)s-%(id)s.%(ext)s');
        $command = "youtube-dl '{$url}' -o '{$path}' --audio-format vorbis --extract-audio";

        $filename = exec($command . ' --get-filename');
        $filename = str_replace('.' . pathinfo($filename, PATHINFO_EXTENSION), '.ogg', $filename);

        exec($command);

        return $filename;
    }

    protected function initTagWriter()
    {
        require_once base_path('app/lib/getid3/getid3.php');
        require_once base_path('app/lib/getid3/write.php');

        $this->tag_writer                    = new \getid3_writetags;
        $this->tag_writer->tagformats        = ['id3v2.3'];
        $this->tag_writer->overwrite_tags    = true;
        $this->tag_writer->tag_encoding      = 'UTF-8';
        $this->tag_writer->remove_other_tags = true;
    }
}

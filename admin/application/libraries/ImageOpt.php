<?php
defined('BASEPATH') OR exit('No direct script access allowed');
#[\AllowDynamicProperties]
    class ImageOpt
    {
        protected $max_width='';
        protected $max_height='';
        protected $quality = 80;
        protected $thumb_sizes = [
            ['width' => 150, 'height' => 150],
            ['width' => 350, 'height' => 240],
            ['width' => 650, 'height' => 460]
        ];
        function __construct()
        {
            $this->CI = &get_instance();
            $this->CI->load->model('CommonModel');
        }
        // Function to optimize and resize images
        public function optimize_image($source_path, $destination_path, $max_width='', $max_height='', $quality='') {
            if(isset($max_width) && !empty($max_width)){
                $this->max_width = $max_width;
            }
            if(isset($max_height) && !empty($max_height)){
                $this->max_height = $max_height;
            }
            if(isset($quality) && !empty($quality)){
                $this->quality = $quality;
            }
            // Get the image information
            list($orig_width, $orig_height, $image_type) = getimagesize($source_path);

            // Calculate the new dimensions
            
                // Create a new image from the original
                switch ($image_type) {
                    case IMAGETYPE_JPEG:
                        $image = imagecreatefromjpeg($source_path);
                        break;
                    case IMAGETYPE_PNG:
                        $image = imagecreatefrompng($source_path);
                        break;
                    case IMAGETYPE_GIF:
                        $image = imagecreatefromgif($source_path);
                        break;
                    default:
                        return false;
                }
                
            if(!isset($this->max_width) || empty($this->max_width)){
                switch ($image_type) {
                    case IMAGETYPE_JPEG:
                        imagejpeg($image, $destination_path, $this->quality);
                        break;
                    case IMAGETYPE_PNG:
                        $compression = 9 - floor($this->quality / 10); // 0 (no compression) to 9
                        imagepng($image, $destination_path, $compression);
                        break;
                    case IMAGETYPE_GIF:
                        imagegif($image, $destination_path);
                        break;
                }
            }else{

                $ratio = $orig_width / $orig_height;
                if ($this->max_width / $this->max_height > $ratio) {
                    $new_width = intval($this->max_height * $ratio);
                    $new_height = $this->max_height;
                } else {
                    $new_height = intval($this->max_width / $ratio);
                    $new_width = $this->max_width;
                }
                // Create a new true color image with the new dimensions
                $new_image = imagecreatetruecolor($new_width, $new_height);

                // Preserve transparency for PNG and GIF
                if ($image_type == IMAGETYPE_PNG || $image_type == IMAGETYPE_GIF) {
                    imagecolortransparent($new_image, imagecolorallocatealpha($new_image, 0, 0, 0, 127));
                    imagealphablending($new_image, false);
                    imagesavealpha($new_image, true);
                }

                // Copy and resize the old image into the new image
                imagecopyresampled($new_image, $image, 0, 0, 0, 0, $new_width, $new_height, $orig_width, $orig_height);

                // Save the image to the destination path
                switch ($image_type) {
                    case IMAGETYPE_JPEG:
                        imagejpeg($new_image, $destination_path,$this->quality);
                        break;
                    case IMAGETYPE_PNG:
                        $compression = 9 - floor($this->quality/ 10); // 0 (no compression) to 9
                        imagepng($new_image, $destination_path, $compression);
                        break;
                    case IMAGETYPE_GIF:
                        imagegif($new_image, $destination_path);
                        break;
                }
                // Free up memory
                imagedestroy($new_image);
            }
            // Free up memory
            imagedestroy($image);
            return true;
        }

        // Function to create thumbnails
        public function create_thumbnails($source_path, $destination_dir) {
            foreach ($this->thumb_sizes as $size) {
                $thumb_path = $destination_dir . '/' . pathinfo($source_path, PATHINFO_FILENAME) . "_{$size['width']}x{$size['height']}." . pathinfo($source_path, PATHINFO_EXTENSION);
                $this->optimize_image($source_path, $thumb_path, $size['width'], $size['height'],$this->quality);
            }
        }
    }


?>
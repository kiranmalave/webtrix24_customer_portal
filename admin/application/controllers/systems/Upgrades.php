<?php
class Upgrades extends CI_Controller
{
    var $basePath="/home/webtrix24/webtrix24code/";
    public function find_diff()
    {
        // $fromVersion = $this->input->get('from'); // e.g., v1.0.0
        // $toVersion = $this->input->get('to');     // e.g., v1.0.1
        $fromVersion = str_replace('_', '.', $this->input->get('from'));
        $toVersion   = str_replace('_', '.', $this->input->get('to'));
        $type = $this->input->get('type');        // 'FE' or 'BE'

        // Define Git repo paths
        $repos = [
            'FE' => $this->basePath.'webtrix_24_FE',
            'BE' => $this->basePath.'webtrix_24_BE',
        ];

        if (!isset($repos[$type])) {
            show_error("Invalid type specified. Use 'FE' or 'BE'.");
        }

        $repoPath = $repos[$type];
        $outputDir = $this->basePath."/upgrade-diff/$toVersion/$type/";
        $outputFile = $outputDir . "changed-files.txt";
        $c1 = "cd $repoPath && git fetch origin $fromVersion:$fromVersion --force";
        exec($c1,$output1, $status1);
        $c2 = "cd $repoPath && git fetch origin $toVersion:$toVersion --force";
        exec($c2, $output2, $status2);
        if (!is_dir($outputDir)) {
            mkdir($outputDir, 0755, true);
        }
        $status=false;
        // Git diff command
        if ($status1 === 0 && $status2 === 0) {
            if($type =="BE"){
            $cmd = "cd $repoPath && git diff --name-status origin/$fromVersion origin/$toVersion | grep -v '^D' | cut -f2 > $outputFile";
            }else{
                // Folders to exclude from the diff
                $excludedFolders = ['plugin/','uploads/'];
                $excludeArgs = implode(' ', array_map(fn($p) => "':(exclude)$p'", $excludedFolders));
                // Build and run the final command
                $cmd = "cd $repoPath && git fetch origin $fromVersion:$fromVersion && git fetch origin $toVersion:$toVersion && ";
                $cmd .= "git diff --name-status $fromVersion $toVersion -- . $excludeArgs | grep -v '^D' | cut -f2 > $outputFile";
            }
            exec($cmd, $output, $status);

        } else {
            echo "❌ Failed to fetch one or both branches from remote.";exit;
        }
       

        if ($status === 0 && file_exists($outputFile)) {
            echo "✅ $type diff saved: $outputFile<br>";
            //echo "<pre>" . file_get_contents($outputFile) . "</pre>";
            $this->create_zip($toVersion,$type);
        } else {
            echo "❌ Git diff failed for $type. Please check tags and access.";
        }
    }
    public function create_zip($toVersion,$type)
    {
        $version = $toVersion; // e.g., v1.0.1
        //$type = $type;  // 'FE' or 'BE'
        // Define repo paths
        $repos = [
            'FE' => $this->basePath.'/webtrix_24_FE',
            'BE' => $this->basePath.'/webtrix_24_BE',
        ];
        if (!isset($repos[$type])) {
            show_error("Invalid type. Use 'FE' or 'BE'.");
        }
        $repoPath = $repos[$type];
        $diffPath = $this->basePath."/upgrade-diff/$version/$type/";
        $fileList = $diffPath . "changed-files.txt";
        //$zipFile = $diffPath . $version.".zip";
        $zipFile = $this->basePath."releases/{$version}/{$type}/code.zip";
        $tempDir = $diffPath . "temp/";

        if(!file_exists($fileList)) {
            show_error("Missing file list at $fileList");
        }
        if(!is_dir($this->basePath."releases/{$version}/{$type}")) {
            mkdir($this->basePath."releases/{$version}/{$type}", 0755, true);
        }
        // Clean temp folder
        if(is_dir($tempDir)) {
            $this->delete_dir($tempDir);
        }
        mkdir($tempDir, 0755, true);
        // Copy changed files to temp folder
        $lines = file($fileList, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $file) {
            $source = rtrim($repoPath, '/') . '/' . $file;
            $destination = $tempDir . $file;
            $destDir = dirname($destination);

            if (!file_exists($source)) {
                echo "Skipping missing file: $source<br>";
                continue;
            }

            if (!is_dir($destDir)) {
                mkdir($destDir, 0755, true);
            }

            copy($source, $destination);
        }
        // Create ZIP from temp folder
        copy($fileList, $this->basePath . "releases/{$version}/{$type}_changed-files.txt");
        $zip = new ZipArchive;
        if ($zip->open($zipFile, ZipArchive::CREATE | ZipArchive::OVERWRITE)) {
            $files = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($tempDir),
                RecursiveIteratorIterator::LEAVES_ONLY
            );
            $normalizedTempDir = rtrim(realpath($tempDir), '/') . '/';
            //$relativePath = substr($filePath, strlen($normalizedTempDir));
            if($type =="BE"){
                $skipFiles = [
                    'application/config/config.php',
                    'application/config/routes.php',
                    '.htaccess',
                ];
            }else{
                $skipFiles = [
                    'systems/css/card.css',
                    'systems/css/clientdashboard.css',
                    'systems/css/cources.css',
                    'systems/css/custom.css',
                    'systems/css/Styles.css',
                    'systems/css/whatsapp.css',
                    'systems/css/campaign.css',
                    'systems/css/dashboardItems.css',
                    'systems/css/overlays.css',
                    'systems/css/admin.bunddle.js',
                    'systems/css/app.js',
                    'systems/css/build.js',
                    'systems/css/buildCss.js',
                    'systems/css/coreModules.js',
                    'systems/css/custom.js',
                    'systems/css/main.js',
                    'systems/css/router.js',
                    'systems/css/subscribeModule.js',
                    'systems/css/text.js',
                    'index.html',
                ];
            }
            

            $zip->addFile($fileList, 'changed-files.txt');
            foreach ($files as $name => $file) {
                if (!$file->isDir()) {
                    $filePath = $file->getRealPath();
                    $relativePath = substr($filePath, strlen($normalizedTempDir));
                    if (in_array($relativePath, $skipFiles)) {
                        echo "⏩ Skipping: $relativePath<br>";
                        continue;
                    }
                    $zip->addFile($filePath, $relativePath);
                }
            }
            $zip->close();
            echo "✅ ZIP created at: $zipFile";
        } else {
            echo "❌ Failed to create ZIP.";
        }

        // Cleanup
        $this->delete_dir($tempDir);
    }

    // Helper to recursively delete temp folder
    private function delete_dir($dir)
    {
        if (!file_exists($dir)) return;
        $files = array_diff(scandir($dir), ['.', '..']);
        foreach ($files as $file) {
            $path = "$dir/$file";
            is_dir($path) ? $this->delete_dir($path) : unlink($path);
        }
        rmdir($dir);
    }
    public function get_file()
    {
        $this->load->helper('file');

        $token   = $this->input->get('token');
        $version = $this->input->get('version'); // e.g., v1.0.4
        $type    = $this->input->get('type');    // FE or BE
        $file    = $this->input->get('file');    // code.zip or update.sql

        // // === 1. Validate token (simplified for now)
        // $allowedTokens = [
        //     'client123securetoken' => true,
        //     'client456securetoken' => true
        // ];

        // if (!isset($allowedTokens[$token])) {
        //     show_error('Unauthorized access', 403);
        // }

        // === 2. Validate input
        if (!preg_match('/^v\d+\.\d+\.\d+$/', $version)) {
            show_error('Invalid version format.', 400);
        }
    
        if (!in_array($type, ['FE', 'BE']) || !in_array($file, ['code.zip', 'update.sql'])) {
            show_error('Invalid file or type.', 400);
        }
    
        // === 3. Build file path
        if ($file === "update.sql") {
            $basePath = $this->basePath . "releases/$version/";
        } else {
            $basePath = $this->basePath . "releases/$version/$type/";
        }
    
        $filePath = $basePath . $file;
    
        if (!file_exists($filePath)) {
            show_error('Requested file not found: ' . $filePath, 404);
        }
    
        // === 4. Serve file
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . basename($filePath) . '"');
        header('Content-Length: ' . filesize($filePath));
        readfile($filePath);
        exit;
    }
    public function list_versions()
    {
        $basePath = $this->basePath.'releases/';
        // $token = $this->input->get('token');

        // // Optional: Validate token
        // $validTokens = ['client123securetoken'];
        // if (!in_array($token, $validTokens)) {
        //     show_error('Unauthorized access', 403);
        // }
        $versions = [];
        foreach (scandir($basePath) as $entry) {
            if ($entry !== '.' && $entry !== '..' && is_dir($basePath . $entry)) {
                $versions[] = $entry;
            }
        }
        // Sort versions in ascending order (e.g., v1.0.1, v1.0.2, ...)
        usort($versions, 'version_compare');

        header('Content-Type: application/json');
        echo json_encode($versions);
    }

    // this is the centeral DB upgrade
    /* use this to upgrade all webtrix24.com clients for common code */
    public function run_all_db_upgrades($customer_id='')
    {
        $where["status"] = "active";
        //$where["sub_domain_name"] = "tushar-s-chaudhari-a";
        if($customer_id == "setupupgrade"){
            $clientVersion = 'v1.0.0';
            $releasePath = $this->basePath.'releases/';
            $log = [];
            $availableVersions = [];
            foreach (scandir($releasePath) as $entry) {
                if ($entry !== '.' && $entry !== '..' && is_dir($releasePath . $entry)) {
                    $availableVersions[] = $entry;
                }
            }
            usort($availableVersions, 'version_compare');
            $currentConfig = $this->db->dsn ? $this->db->dsn : [
                'hostname' => $this->db->hostname,
                'username' => $this->db->username,
                'password' => $this->db->password,
                'database' => $this->db->database,
                'dbdriver' => $this->db->dbdriver,
                'dbprefix' => $this->db->dbprefix,
                'pconnect' => $this->db->pconnect,
                'db_debug' => false, // override here
                'char_set' => $this->db->char_set,
                'dbcollat' => $this->db->dbcollat
            ];
            $cdatabase = $this->db->database;
            $this->db = $this->load->database($currentConfig, true);
            $this->switch_database("webtrix24_setup");
            $check = $this->db->query("SHOW TABLES LIKE 'ab_system_version'");
            if ($check && $check->num_rows()) {
                $query = $this->db->query("SELECT version FROM ab_system_version ORDER BY upgrade_id DESC LIMIT 1");
                if ($query && $query->num_rows()) {
                    $clientVersion = $query->row()->version;
                }
            } else {
                $log[] = "ℹ️ system_version table not found — assuming base version v1.0.0";
            }

            $log[] = "➡️ Current version: $clientVersion";

            $fromIndex = array_search($clientVersion, $availableVersions);
            if ($fromIndex === false || $fromIndex === count($availableVersions) - 1) {
                $log[] = "✅ Already up to date.";
            }
            //$fromIndex = "-1";
            // Upgrade through next versions
            for ($i = $fromIndex + 1; $i < count($availableVersions); $i++) {
                $ver = $availableVersions[$i];
                $sqlPath = "$releasePath/$ver/update.sql";
                $this->run_safe_sql($this->basePath."releases/$ver/update.sql", $log, $ver);
                $this->db->insert('ab_system_version', ['version' => $ver,'old_version' => $clientVersion,"code_type"=>"DB"]);
            }
            print "<pre>";
            print_r($log);
            print "</pre>";
            die();

        }else{
            $where["customer_id"] = $customer_id;
            $customerDetails = $this->CommonModel->getMasterDetails('customer','',$where);
            if(!isset($customerDetails) || empty($customerDetails)){
                echo "No customer found"; exit;
            }
        }

        $releasePath = $this->basePath.'releases/';
        $log = [];
        $availableVersions = [];
        foreach (scandir($releasePath) as $entry) {
            if ($entry !== '.' && $entry !== '..' && is_dir($releasePath . $entry)) {
                $availableVersions[] = $entry;
            }
        }
        usort($availableVersions, 'version_compare');
        //print_r($availableVersions);
        foreach ($customerDetails as $client) {
            $log[] = "🔧 Subdomain: {$client->sub_domain_name}";
            
            $currentConfig = $this->db->dsn ? $this->db->dsn : [
                'hostname' => $this->db->hostname,
                'username' => $this->db->username,
                'password' => $this->db->password,
                'database' => $this->db->database,
                'dbdriver' => $this->db->dbdriver,
                'dbprefix' => $this->db->dbprefix,
                'pconnect' => $this->db->pconnect,
                'db_debug' => false, // override here
                'char_set' => $this->db->char_set,
                'dbcollat' => $this->db->dbcollat
            ];
            $cdatabase = $this->db->database;
            $this->db = $this->load->database($currentConfig, true);
            $this->switch_database("webtrix24_customers_".$client->database_name);
            
            //$clientDb = $this->load->database($config, true);
            $clientVersion = 'v1.0.0';

            // Check current DB version
            // Check if system_version table exists
            $check = $this->db->query("SHOW TABLES LIKE 'ab_system_version'");
            if ($check && $check->num_rows()) {
                $query = $this->db->query("SELECT version FROM ab_system_version ORDER BY upgrade_id DESC LIMIT 1");
                if ($query && $query->num_rows()) {
                    $clientVersion = $query->row()->version;
                }
            } else {
                $log[] = "ℹ️ system_version table not found — assuming base version v1.0.0";
            }

            $log[] = "➡️ Current version: $clientVersion";

            $fromIndex = array_search($clientVersion, $availableVersions);
            if ($fromIndex === false || $fromIndex === count($availableVersions) - 1) {
                $log[] = "✅ Already up to date.";
                continue;
            }
            //$fromIndex = "-1";
            // Upgrade through next versions
            for ($i = $fromIndex + 1; $i < count($availableVersions); $i++) {
                $ver = $availableVersions[$i];
                $sqlPath = "$releasePath/$ver/update.sql";
                $this->run_safe_sql($this->basePath."releases/$ver/update.sql", $log, $ver);
                $this->db->insert('ab_system_version', ['version' => $ver,'old_version' => $clientVersion,"code_type"=>"DB"]);
                
            }
        }
        $this->db = $this->load->database($currentConfig, true);
        $this->switch_database($cdatabase);
        print "<pre>";
        print_r($log);
        print "</pre>";
    }
    private function run_safe_sql($sqlPath,&$log, $version = null)
    {
        if (!file_exists($sqlPath)) {
            $log[] = "⚠️ SQL file not found: $sqlPath";
            return;
        }
        //$this->datatables->query("USE `$this->db->`");
        $sqlContent = file_get_contents($sqlPath);
        $statements = array_filter(array_map('trim', explode(';', $sqlContent)));

        $log[] = "🔧 Executing SQL for version: $version";

        foreach ($statements as $statement) {
            if (empty($statement)) continue;

            $originalStmt = $statement;
            $statement = trim($statement);

            // === Check for CREATE TABLE ===
            if (preg_match('/CREATE TABLE\s+`?(\w+)`?/i', $statement, $matches)) {
                $tableName = $matches[1];
                
                $check = $this->db->query("SHOW TABLES LIKE '$tableName'");
                if ($check && $check->num_rows()) {
                    $log[] = "⚠️ Skipped CREATE TABLE `$tableName` (already exists)";
                    continue;
                }
            }

            // === Check for ALTER TABLE ADD COLUMN ===
            if (preg_match('/ALTER TABLE\s+`?(\w+)`?.*ADD(?:\s+COLUMN)?\s+`?(\w+)`?/i', $statement, $matches)) {
                $table = $matches[1];
                $column = $matches[2];
                $check = $this->db->query("SHOW COLUMNS FROM `$table` LIKE '$column'");
                if ($check && $check->num_rows()) {
                    $log[] = "⚠️ Skipped ALTER TABLE `$table` ADD `$column` (already exists)";
                    continue;
                }
            }
            if (preg_match('/ALTER TABLE\s+`?(\w+)`?.*ADD\s+PRIMARY\s+KEY/i', $statement, $matches)) {
                $table = $matches[1];
            
                // Check if the table already has a PRIMARY KEY
                $check = $this->db->query("SHOW KEYS FROM `$table` WHERE Key_name = 'PRIMARY'");
                if ($check && $check->num_rows()) {
                    $log[] = "⚠️ Skipped ADD PRIMARY KEY on `$table` (already exists)";
                    continue;
                }
            }

            // === Execute the statement ===
            if ($this->db->query($originalStmt)) {
                $log[] = "✅ Executed: " . substr($originalStmt, 0, 80) . "...";
            } else {
                // $error = $this->db->error();
                // $log[] = "❌ Failed: " . substr($originalStmt, 0, 80) . "... → {$error['message']}";
                $error =  $this->db->error();
                $log[] = "❌ Manual Fix Needed: " . substr($originalStmt, 0, 100) . "...";
                $log[] = "   → Error: {$error['message']} [Code: {$error['code']}]";
            
                // Optional: collect critical errors separately
                $manualFixes[] = [
                    'version' => $version,
                    'statement' => $originalStmt,
                    'error' => $error['message'],
                    'code' => $error['code']
                ];

                if (!empty($manualFixes)) {
                    $log[] = "⚠️ The following SQL statements could not be applied automatically:";
                    foreach ($manualFixes as $fix) {
                        $log[] = "Version: {$fix['version']}";
                        $log[] = "Statement: " . $fix['statement'];
                        $log[] = "Error: {$fix['error']} [{$fix['code']}]";
                        $log[] = str_repeat('-', 40);
                    }
                }
            }
        }
    }
    private function switch_database($dbName)
    {
        if ($this->db->conn_id->select_db($dbName)) {
            $this->db->database = $dbName;
            return true;
        } else {
            log_message('error', "❌ Failed to switch to DB: $dbName");
            return false;
        }
    }
    public function remote_upgrade_all()
    {
        $this->load->helper(['file']);
        $type = $this->input->get('type') ?: 'FE';
        
        $basePath = $this->basePath.'releases/';
        $versionList = [];
        foreach (scandir($basePath) as $entry) {
            if ($entry !== '.' && $entry !== '..' && is_dir($basePath . $entry)) {
                $versionList[] = $entry;
            }
        }
        // Sort versions in ascending order (e.g., v1.0.1, v1.0.2, ...)
        usort($versionList, 'version_compare');
        if (!$versionList || !is_array($versionList)) {
            die("❌ Could not fetch version list.");
        }
        if($type == "FE"){
            $projectPath = "/home/webtrix24/public_html/clients";
        }else{
            $projectPath = "/home/webtrix24/public_html/clients/API/";
        }
        
        $currentVersion = 'v1.0.0';
        $currentConfig = $this->db->dsn ? $this->db->dsn : [
            'hostname' => $this->db->hostname,
            'username' => $this->db->username,
            'password' => $this->db->password,
            'database' => $this->db->database,
            'dbdriver' => $this->db->dbdriver,
            'dbprefix' => $this->db->dbprefix,
            'pconnect' => $this->db->pconnect,
            'db_debug' => false, // override here
            'char_set' => $this->db->char_set,
            'dbcollat' => $this->db->dbcollat
        ];
        $cdatabase = $this->db->database;
        $this->db = $this->load->database($currentConfig, true);
        $this->switch_database("webtrix24_setup");
        $check = $this->db->query("SHOW TABLES LIKE 'ab_system_version'");
        if ($check && $check->num_rows()) {
            $query = $this->db->query("SELECT version FROM ab_system_version where code_type='".$type."' ORDER BY upgrade_id DESC LIMIT 1");
            if ($query && $query->num_rows()) {
                $currentVersion = $query->row()->version;
            }
        } else {
            $log[] = "ℹ️ system_version table not found — assuming base version v1.0.0";
        }
        $fromIndex = array_search($currentVersion, $versionList);
        $toIndex = count($versionList) - 1;
        if ($fromIndex === false || $fromIndex >= $toIndex) {
            echo "✅ Already on latest version ($currentVersion).<br>";
            return;
        }
        // Prepare backup
        $ts = date("Ymd_His") . "_$type";
        $backupDir = dirname($projectPath) . "/backups/$ts/";
        @mkdir($backupDir, 0755, true);

        // Folders to include
        if($type == "BE"){
            $folders = ['application', 'system', 'vendor'];
        }
        if($type == "FE"){
            $folders = ['systems','assets'];
        }
            $success = true; // Overall status tracker
            // Copy selected folders
            foreach ($folders as $folder) {
                $src = rtrim($projectPath, '/') . "/$folder";
                $dst = $backupDir . $folder;
                exec("cp -r $src $dst", $output, $status);
                if ($status !== 0 || !is_dir($dst)) {
                    $log[] = "❌ Failed to copy folder: $folder";
                    $success = false;
                } else {
                    $log[] = "✅ Copied folder: $folder";
                }
            }

            // Copy root-level files
            $rootFiles = scandir($projectPath);
            foreach ($rootFiles as $file) {
                $fullPath = $projectPath . $file;
                $backupPath = $backupDir . $file;
                if (is_file($fullPath)) {
                    if (!copy($fullPath, $backupPath)) {
                        $log[] = "❌ Failed to copy file: $file";
                        $success = false;
                    } else {
                        $log[] = "✅ Copied file: $file";
                    }
                }
            }   

        //exec("cp -r $projectPath {$backupDir}code");
        if($type == "BE"){
        $CI =& get_instance();
        $CI->load->database();

        $db_user = $CI->db->username;
        $db_pass = $CI->db->password;
        $db_name = "webtrix24_setup";
        $dbBackupCmd = "mysqldump --no-tablespaces -u'{$db_user}' -p'{$db_pass}' {$db_name} > {$backupDir}db.sql";
        exec($dbBackupCmd, $output2, $status2);
        }else{
            $status2 = 0;
        }
        if (!$success || $status2 !== 0) {
            echo "❌ Backup failed. Upgrade aborted.<br>";
            echo "Code backup status: {$success}<br>";
            echo "DB backup status: $status2<br>";
            //log_message('error', "Code backup failed: " . implode("\n", $success));
            log_message('error', "Msql backup failed: " . implode("\n", $output2));
            return;
        }
        $log = [];
        $log[] = "🔁 Upgrade from $currentVersion to " . end($versionList);

        for ($i = $fromIndex + 1; $i <= $toIndex; $i++) {
            $version = $versionList[$i];
            $log[] = "⏫ Applying version $version";

            // Download and extract code.zip
            //$zipUrl = $this->apiBase . "upgrade/get_file?version=$version&type=$type&file=code.zip&token={$this->token}";
            $zipUrl = $basePath.$version."/".$type."/code.zip";// "/tmp/code_$version.zip";
            $zipLocal = "/home/webtrix24/tmp/code_$version.zip";
            file_put_contents($zipLocal, file_get_contents($zipUrl));
            $zip = new ZipArchive;
            if ($zip->open($zipLocal)) {
                $zip->extractTo($projectPath);
                $zip->close();
                $log[] = "✅ Extracted code.zip for $version";
            } else {
                $log[] = "❌ Failed to extract $version";
                return $this->_rollback($backupDir, $log,$type);
            }
            // Download and execute update.sql
            if($type == "BE"){
                $this->run_safe_sql($this->basePath."releases/$version/update.sql", $log, $version);
            }
            
            // Update version in DB
            $this->db->insert('ab_system_version', ['version' => $version,"old_version"=>$currentVersion,"code_type"=>$type]);
            // Update frontend ?v=1.x.x if FE
            if ($type === 'FE') {
                $indexPath = '/home/webtrix24/public_html/clients/index.html';
                if (file_exists($indexPath)) {
                    $html = file_get_contents($indexPath);
                    $vname = str_replace("v","v=",$version);
                    $updated = preg_replace('/(\.js|\.css)\?v=[\d.]+/','$1?'.$vname,$html);
                    file_put_contents($indexPath, $updated);
                    $log[] = "🔁 index.html version updated to $version";
                } else {
                    $log[] = "⚠️ index.html not found.";
                }
            }
        }
        $log[] = "🎉 Upgrade completed.";
        write_file(APPPATH . "logs/remote_upgrade_$type.log", implode(PHP_EOL, $log) . PHP_EOL, 'a');
        //delete backups
         $cmd = "rm -rf ".$backupDir."";
         exec($cmd, $output, $status);

        echo implode("<br>", $log);
        echo $output;
    }



}


?>
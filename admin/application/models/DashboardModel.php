<?php
defined('BASEPATH') or exit('No direct script access allowed');

class DashboardModel extends CI_Model
{

    function __construct()
    {
        parent::__construct();
        $this->load->database();
    }

    public function incomeLastWeek($last_date)
    {
        $sql = 'SELECT SUM(amount) as amount FROM ab_receipts WHERE Date(created_date)= "' . $last_date . '" ';
        $query = $this->db->query($sql);
        if (isset($other["resultType"]) && !empty($other["resultType"])) {
            $result = $query->result_array();
        } else {
            $result = $query->result();
        }
        return $result;
    }
    public function incomeByMonths($firstDate, $lastDate)
    {
        $sql = 'SELECT SUM(amount) as amount FROM ab_receipts WHERE Date(created_date) BETWEEN "' . $firstDate . '" AND "' . $lastDate . '" ';
        $query = $this->db->query($sql);
        if (isset($other["resultType"]) && !empty($other["resultType"])) {
            $result = $query->result_array();
        } else {
            $result = $query->result();
        }
        return $result;
    }

    public function getAllPOCArchivedTarget($where = '')
    {
        $this->db->select_sum('amountInFigure');
        $this->db->select('a.name,u.myTarget');
        $this->db->from('donorRecipts as t');

        $this->db->where($where);
        $this->db->join('user_extra_details as u', 'u.adminID = t.pointOfContactName', 'LEFT');
        $this->db->join('admin as a', 'a.adminID = t.pointOfContactName', 'LEFT');
        $this->db->group_by("t.pointOfContactName");
        $query = $this->db->get();
        $sqlerror = $this->db->error();
        $result = $query->result();
        $this->errorlogs->checkDBError($sqlerror, 'SQL Error', dirname(__FILE__), __LINE__, __METHOD__);
        // print_r($result);exit;
        return $result;
        // SELECT player, SUM(score) as sum_score FROM game GROUP BY player;
    }
    public function getAllPOCArchivedTargetOther($where = '')
    {
        $this->db->select_sum('amountInFigure');
        $this->db->select('pointOfContactName');
        $this->db->from('donorRecipts');

        $this->db->where($where);
        $this->db->group_by("pointOfContactName");
        $query = $this->db->get();
        $sqlerror = $this->db->error();
        $result = $query->result();
        $this->errorlogs->checkDBError($sqlerror, 'SQL Error', dirname(__FILE__), __LINE__, __METHOD__);
        // print_r($result);exit;
        return $result;
        // SELECT player, SUM(score) as sum_score FROM game GROUP BY player;
    }
    public function getCategoryBySlug($slug)
    {
        $sql = 'SELECT category_id, slug, categoryName,cat_color 
        FROM ab_categories 
        WHERE parent_id = ( 
            SELECT category_id 
            FROM ab_categories 
            WHERE slug = "' . $slug . '"
        ) AND status = "active" ';

        $query = $this->db->query($sql, array($slug));
        $sqlerror = $this->db->error();
        $this->errorlogs->checkDBError($sqlerror, 'SQL Error', dirname(__FILE__), __LINE__, __METHOD__);
        $result = $query->result();
        return $result;
    }
    //LEADS API MODEL
    public function getLeadsByCategory($category)
    {
        $sql = 'SELECT COUNT(customer_id) as amount FROM ab_customer WHERE stages = "' . $category . '" AND status="active" AND type="lead" ';
        $query = $this->db->query($sql);
        if (isset($other["resultType"]) && !empty($other["resultType"])) {
            $result = $query->result_array();
        } else {
            $result = $query->result();
        }
        return $result;
    }
    public function getLeadsBySources($category)
    {
        $sql = 'SELECT COUNT(customer_id) as amount FROM ab_customer WHERE lead_source = "' . $category . '" AND status="active" AND type="lead" ';
        $query = $this->db->query($sql);
        if (isset($other["resultType"]) && !empty($other["resultType"])) {
            $result = $query->result_array();
        } else {
            $result = $query->result();
        }
        return $result;
    }
    public function getUnattendedList($where = array())
    {
        $sql = "SELECT * FROM ab_customer WHERE last_activity_type IS NULL";
        if ((isset($where['startDate']) && !empty($where['startDate'])) && (isset($where['endDate']) && !empty($where['endDate']))) {
            $sql .= " AND Date(last_activity_date) BETWEEN " . $where['startDate'] . " AND " . $where['endDate'] . "";
        }
        $query = $this->db->query($sql);
        $sqlerror = $this->db->error();
        $this->errorlogs->checkDBError($sqlerror, 'SQL Error', dirname(__FILE__), __LINE__, __METHOD__);
        return $query->result_array();
    }
    public function getPendingFollowList()
    {
        $currentDate = date('y-m-d');
        $sql = "SELECT * FROM  ab_tasks
        WHERE (start_date<=>? OR start_date IS NULL)
        AND (due_date<=? OR due_date IS NOT NULL)
        AND (task_status IN ('pending','In Progress'))";
        $query = $this->db->query($sql, array($currentDate, $currentDate));
        $sqlerror = $this->db->error();
        $this->errorlogs->checkDBError($sqlerror, 'SQL Error', dirname(__FILE__), __LINE__, __METHOD__);
        return $query->result_array();
    }

    public function getUpcomingFollowList()
    {
        $currentDate = date('y-m-d');
        $sql = "SELECT * FROM ab_tasks 
        WHERE ( start_date <=> ? OR start_date IS NULL)
        AND (due_date >= ? OR due_date IS NULL)
        AND (task_status IN ('pending', 'In Progress'))";
        $query = $this->db->query($sql, array($currentDate, $currentDate));
        $sqlerror = $this->db->error();
        $this->errorlogs->checkDBError($sqlerror, 'SQL Error', dirname(__FILE__), __LINE__, __METHOD__);
        return $query->result_array();
    }
    //TASK API MODEL
    public function getTasksCount($category, $filters = [], $other = [])
    {
    $sql = 'SELECT COUNT(task_id) as amount FROM ab_tasks WHERE task_status = ? AND status="active" AND record_type="task"';   
    $params = [$category];   
    foreach ($filters as $key => $value) {
        $sql .= " AND {$key} = ?";
        $params[] = $value;
    }   
    $query = $this->db->query($sql, $params);   
    if (isset($other["resultType"]) && !empty($other["resultType"])) {
        $result = $query->result_array();
    } else {
        $result = $query->result();
    } 
    return $result;
    }
}

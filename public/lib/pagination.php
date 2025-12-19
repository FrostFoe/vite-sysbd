<?php

require_once __DIR__ . "/constants.php";

class Pagination
{
    private $page;
    private $per_page;
    private $total_items;
    private $total_pages;
    private $offset;

    public function __construct(
        $page = 1,
        $per_page = DEFAULT_PAGE_SIZE,
        $total_items = 0,
    ) {
        $this->page = max(1, intval($page));
        $this->per_page = max(1, min(intval($per_page), MAX_PAGE_SIZE));
        $this->total_items = max(0, intval($total_items));
        $this->total_pages = ceil($this->total_items / $this->per_page) ?: 1;

        if ($this->page > $this->total_pages) {
            $this->page = $this->total_pages;
        }

        $this->offset = ($this->page - 1) * $this->per_page;
    }

    public function getPage()
    {
        return $this->page;
    }

    public function getPerPage()
    {
        return $this->per_page;
    }

    public function getOffset()
    {
        return $this->offset;
    }

    public function getTotalItems()
    {
        return $this->total_items;
    }

    public function getTotalPages()
    {
        return $this->total_pages;
    }

    public function getLimitClause()
    {
        return "LIMIT " .
            intval($this->per_page) .
            " OFFSET " .
            intval($this->offset);
    }

    public function toArray()
    {
        return [
            "current_page" => $this->page,
            "per_page" => $this->per_page,
            "total_items" => $this->total_items,
            "total_pages" => $this->total_pages,
            "has_next" => $this->page < $this->total_pages,
            "has_previous" => $this->page > 1,
        ];
    }
}

?>

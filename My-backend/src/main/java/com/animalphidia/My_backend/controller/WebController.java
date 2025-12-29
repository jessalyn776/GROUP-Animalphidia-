package com.animalphidia.My_backend.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Web Controller - Serves frontend templates from src/main/resources/templates
 */
@Controller
public class WebController {

    @GetMapping("/")
    public String index() {
        return "index";
    }

    @GetMapping("/{page}.html")
    public String servePage(@PathVariable("page") String page) {
        // simple sanitization - allow letters, numbers, dash and underscore only
        if (page == null || !page.matches("[a-zA-Z0-9_-]+")) {
            return "index";
        }

        // Check if the template exists in classpath
        ClassPathResource resource = new ClassPathResource("templates/" + page + ".html");
        if (resource.exists()) {
            return page;
        }

        // fallback to index if template not found
        return "index";
    }
}
package com.ong.divas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class DivasApplication {

	public static void main(String[] args) {
		SpringApplication.run(DivasApplication.class, args);
	}

}

package com.ong.divas.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ong.divas.entities.Localidade;
import com.ong.divas.repository.LocalidadeRepository;

@RestController
@RequestMapping("/localidades")
public class LocalidadeController {
    @Autowired
    private LocalidadeRepository repository;

    @PostMapping
    public ResponseEntity<Localidade> criar(@RequestBody Localidade localidade) {
        return ResponseEntity.ok(repository.save(localidade));
    }

    @GetMapping
    public ResponseEntity<List<Localidade>> listar() {
        return ResponseEntity.ok(repository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Localidade> buscar(@PathVariable Long id) {
        return repository.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Localidade> atualizar(@PathVariable Long id, @RequestBody Localidade nova) {
        return repository.findById(id).map(localidade -> {
            localidade.setNomeLocal(nova.getNomeLocal());
            localidade.setEndereco(nova.getEndereco());
            localidade.setCidade(nova.getCidade());
            localidade.setUf(nova.getUf());
            localidade.setCep(nova.getCep());
            return ResponseEntity.ok(repository.save(localidade));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

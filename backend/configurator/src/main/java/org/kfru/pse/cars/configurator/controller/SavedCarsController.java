package org.kfru.pse.cars.configurator.controller;

import org.kfru.pse.cars.configurator.model.SavedCar;
import org.kfru.pse.cars.configurator.repository.SavedCarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RequestMapping("/saved-cars")
@RestController
public class SavedCarsController {

  SavedCarRepository savedCarRepository;

  @Autowired
  SavedCarsController(SavedCarRepository savedCarRepository) {
    this.savedCarRepository = savedCarRepository;
  }

  @GetMapping
  public List<SavedCar> getAllSavedCars() {
    return savedCarRepository.findAll();
  }

  @PostMapping
  public SavedCar saveCar(@RequestBody SavedCar carToSave) {
    return savedCarRepository.save(carToSave);
  }

}

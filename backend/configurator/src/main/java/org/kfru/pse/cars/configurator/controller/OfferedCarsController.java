package org.kfru.pse.cars.configurator.controller;

import org.kfru.pse.cars.configurator.model.OfferedCar;
import org.kfru.pse.cars.configurator.repository.OfferedCarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@CrossOrigin
@RequestMapping("/offered-cars")
@RestController
public class OfferedCarsController {


  private final OfferedCarRepository offeredCarRepository;

  @Autowired
  public OfferedCarsController(OfferedCarRepository offeredCarRepository) {
    this.offeredCarRepository = offeredCarRepository;
  }

  @GetMapping
  public List<OfferedCar> getAllOfferedCars() {
    return offeredCarRepository.findAll();
  }

  @GetMapping("/{id}")
  public OfferedCar getOfferedCarById(@PathVariable Integer id) {
    Optional<OfferedCar> desiredCar = offeredCarRepository.findById(id);
    if (desiredCar.isPresent()) {
      return desiredCar.get();
    } else {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Car not found");
    }
  }

}

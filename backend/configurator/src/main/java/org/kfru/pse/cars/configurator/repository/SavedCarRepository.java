package org.kfru.pse.cars.configurator.repository;

import jakarta.transaction.Transactional;
import org.kfru.pse.cars.configurator.model.SavedCar;
import org.springframework.data.repository.ListCrudRepository;


@Transactional
public interface SavedCarRepository extends ListCrudRepository<SavedCar, String> {}

package org.kfru.pse.cars.configurator.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SavedCar {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  String id;

  @Column(nullable = false)
  String name;

  @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
  @Column(nullable = true)
  List<ChosenCarFeature> features;
}

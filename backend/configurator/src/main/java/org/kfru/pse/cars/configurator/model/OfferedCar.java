package org.kfru.pse.cars.configurator.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table
@Data
@AllArgsConstructor
@NoArgsConstructor
public class OfferedCar {

  @Id
  @Column(nullable = false)
  int id;
  @Column(nullable = false)
  String name;
  @Column(nullable = false)
  String slogan;

  @Column(nullable = false)
  boolean available;

  @OneToMany
  @Column(nullable = true)
  List<CarFeature> features;

  @Column(nullable = false)
  String imageUrl;

}

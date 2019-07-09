import { Component, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { BaseService } from '../../shared/classes/base-service.service';
import { CryptoProvider } from '../crypto/crypto.provider';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from 'n-puzzle-entity/dist/server/user/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import moment = require('moment');

@Component()
export class UserService extends BaseService<User> {
  constructor(
    @InjectRepository(User) private readonly userRepository: MongoRepository<User>,
    @Inject('CryptoProvider') private readonly cryptoService: CryptoProvider,
  ) {
      super(userRepository);
  }

  async findAllByCriteria(options): Promise<Array<User>> {
    const where: any = {};
    const $and: any = [];

    if (options.latitude && options.longitude) {
      const { DEFAULT_DISTANCE_GEO_SEARCH, DEFAULT_TRAVEL_TIME_GEO_SEARCH } = process.env;
      const { latitude, longitude, distance = parseInt(DEFAULT_DISTANCE_GEO_SEARCH, 10), travelTime = parseInt(DEFAULT_TRAVEL_TIME_GEO_SEARCH, 10) } = options;
      const centerSphere = [[parseFloat(longitude), parseFloat(latitude)], distance / 6378.1];
      $and.push({ geoPosition : { $geoWithin : { $centerSphere: centerSphere } } });
    }

    if (options.role) {
      $and.push({ role : options.role});
    }
    
    if ($and.length) {
      where.$and = $and;
    }

    return await this.userRepository.find({ where });
  }

  async findOneByEmail(email:string): Promise<User>{
    return await this.userRepository.findOne({email})
  }

  async create(dto: CreateUserDto): Promise<User> {
    let user = new User();
    user.role = dto.role
    user.created = new Date()
    user = await this.fillUserProperties(user, dto)
    if (dto.password) {
      user.hashedPassword = this.cryptoService.hashPassword(dto.password)
    }
    return await this.userRepository.save(user);
  }

  async updateGeneric(id: string, fieldName: string, value) {
    const user = await this.userRepository.findOneOrFail(id);
    return await this.userRepository.updateOne({_id:user.id}, {$set:{
      [fieldName] : value
    }});
  }
  
  async update(userDB: User, dto: UpdateUserDto): Promise<User> {
    userDB = await this.fillUserProperties(userDB, dto)
    return await this.userRepository.save(userDB);
  }

  async fillUserProperties(userDest: User, userSrc: CreateUserDto | UpdateUserDto) {
    if (userSrc.email) {
      userDest.email = userSrc.email.toLowerCase()
    }
    userDest.firstName = userSrc.firstName
    userDest.lastName = userSrc.lastName
    userDest.phoneNumber = userSrc.phoneNumber
    if (userSrc.birthdate) {
      userDest.birthdate = moment(userSrc.birthdate).toDate()
    }
    userDest.address = userSrc.address
    userDest.addressCity = userSrc.addressCity
    userDest.addressPostalCode = userSrc.addressPostalCode
    userDest.geoPosition = userSrc.geoPosition
    userDest.gender = userSrc.gender
    return userDest
  }

  async deleteUser(user: User) {
    return await this.userRepository.delete(user)
  }

  async saveUsers(users: User[]){
    return await this.userRepository.save(users)
  }
}
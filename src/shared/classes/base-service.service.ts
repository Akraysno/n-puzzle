import { NotFoundException, Logger } from '@nestjs/common';
import { MongoRepository } from 'typeorm';
import { User } from 'n-puzzle-entity/dist/server/user/user.entity';
import { ObjectID } from 'mongodb';

export class BaseService<T> {
    protected logger

    constructor(
        private repository: MongoRepository<T>,
    ) {
        this.logger = new Logger('Base service');
    }

    geRepo(): MongoRepository<T> {
        return this.repository;
    }

    async findOne(params: string | any) {
        return await this.repository.findOne(params);
    }

    async findOneOrFail(params: string | any) {
        try {
          return await this.repository.findOneOrFail(params);
        } catch (e) {
          throw new NotFoundException();
        }
    }

    async updateGeneric(id:string | ObjectID, field: string, value: string | boolean) {
        if(typeof id === 'string' || id instanceof String){
            id = new ObjectID(id)
        }
        return this.repository.updateOne({_id: id}, {$set: {[field] : value}})
    }
}

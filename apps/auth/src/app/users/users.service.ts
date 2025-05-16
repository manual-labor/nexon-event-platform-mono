import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/users.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) { }

  async create(createUserRequest: CreateUserDto): Promise<User> {

    let hashedPassword;
    if (createUserRequest.password) {
      hashedPassword = await bcrypt.hash(createUserRequest.password, 10);
    }
    const createdUser = new this.userModel({
      ...createUserRequest,
      ...(hashedPassword && { password: hashedPassword }),
    });
    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`사용자 ID ${id}를 찾을 수 없습니다`);
    }
    return user;
  }
  
  async findByEmail(email: string): Promise<User|null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`사용자 ID ${id}를 찾을 수 없습니다`);
    }

    return updatedUser;
  }

  async updateLastLogin(id: string): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { lastLogin: new Date() }, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`사용자 ID ${id}를 찾을 수 없습니다`);
    }

    return updatedUser;
  }

  async remove(id: string): Promise<User> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException(`사용자 ID ${id}를 찾을 수 없습니다`);
    }
    return deletedUser;
  }
}

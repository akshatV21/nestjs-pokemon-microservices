import { Connection, Document, FilterQuery, Model, QueryOptions, Types, UpdateQuery } from 'mongoose'

type ProjectionType<T> = Partial<Record<keyof T, 0 | 1>>

type ProjectionKeysUninon<T extends ProjectionType<any>, S extends Record<string, any>> = T extends Record<string, infer V>
  ? V extends 1
    ? Exclude<keyof S, keyof T>
    : keyof T
  : never

type FindDocResult<Doc extends Document, Projection extends ProjectionType<Doc>, S extends Record<string, any>> = Omit<
  Doc,
  ProjectionKeysUninon<Projection, S>
>

export class AbstractRepository<T extends Document, S extends Record<string, any>> {
  constructor(protected readonly AbstractModel: Model<T>, private readonly connection: Connection) {}

  async create(createDto: S, id: Types.ObjectId = new Types.ObjectId()): Promise<T> {
    const entity = new this.AbstractModel({ ...createDto, _id: id })
    return entity.save()
  }

  async find<Props extends ProjectionType<T>>(
    query: FilterQuery<T>,
    projection?: Props,
    options?: QueryOptions<T>,
  ): Promise<FindDocResult<T, Props, S>[]> {
    return await this.AbstractModel.find(query, projection, options)
  }

  async findOne<Props extends ProjectionType<T>>(
    query: FilterQuery<T>,
    projection?: Props,
    options?: QueryOptions<T>,
  ): Promise<FindDocResult<T, Props, S> | undefined> {
    return this.AbstractModel.findOne(query, projection, options)
  }

  async findById<Props extends ProjectionType<T>>(
    id: string | Types.ObjectId,
    projection?: Props,
    options?: QueryOptions<T>,
  ): Promise<FindDocResult<T, Props, S>> {
    return this.AbstractModel.findById(new Types.ObjectId(id), projection, options)
  }

  async update(id: string | Types.ObjectId, updateDto: UpdateQuery<T>, options: QueryOptions<T> = { new: true }) {
    return this.AbstractModel.findByIdAndUpdate(id, updateDto, options)
  }

  async updateByQuery(query: FilterQuery<T>, updateDto: UpdateQuery<T>) {
    return this.AbstractModel.findOneAndUpdate(query, updateDto, { new: true })
  }

  async updateMany(query: FilterQuery<T>, updateDto: UpdateQuery<T>) {
    return this.AbstractModel.updateMany(query, updateDto, { new: true })
  }

  async startTransaction() {
    const session = await this.connection.startSession()
    session.startTransaction()
    return session
  }

  async exists(query: FilterQuery<T>) {
    return this.AbstractModel.exists(query)
  }

  async delete(query: FilterQuery<T>, options?: QueryOptions<T>) {
    return this.AbstractModel.deleteOne(query, options)
  }

  async deleteMany(query: FilterQuery<T>) {
    return this.AbstractModel.deleteMany(query)
  }
}

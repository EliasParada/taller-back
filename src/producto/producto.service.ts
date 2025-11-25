import { ConflictException, Injectable } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Producto } from './schemas/Producto.schema';
import { ImageHelperService } from 'src/image-helper/image-helper.service';

@Injectable()
export class ProductoService {
  constructor(
    @InjectModel(Producto.name)
    private readonly productoModel: Model<Producto>,
    private readonly imageHelperService: ImageHelperService,
  ) {}

  async create(createProductoDto: CreateProductoDto, image: Express.Multer.File) {
    const imageInfo = this.imageHelperService.getImage(image);
    const imageId = (await imageInfo)._id;
    const { Nombre, Descripcion, Precio, Valoracion, stock } = createProductoDto;
    const newProducto = new this.productoModel({
      Nombre,
      Descripcion,
      Precio,
      Imagen: imageId,
      Valoracion,
      stock,
    });
   try {
      await newProducto.save();
    } catch (error) {
      throw new ConflictException(
        'Error de validación: ' + JSON.stringify(error),
      );
    }
    return newProducto;
  }

  async findAll() {
    const productos = await this.productoModel.find().exec(); //.populate('Imagen').exec();

    // >>> Mostrar todos los productos originales
    console.log('>>> PRODUCTOS ORIGINALES');
    console.log(JSON.stringify(productos, null, 2));

    // >>> Mostrar solo imágenes sin presigned URLs
    console.log('>>> IMÁGENES ORIGINALES');
    productos.forEach(p => {
      console.log({
        productoId: p._id,
        imagen: p.Imagen
      });
    });

    // Procesamiento original
    const productosConImagenes = await Promise.all(
      productos.map(async (producto) => {
        producto.Imagen = await this.imageHelperService.getPresignedImageUrl(producto.Imagen);
        return producto;
      }),
    );

    return productosConImagenes;
    // const productos = await this.productoModel.find().populate('Imagen').exec();
    // const productosConImagenes = await Promise.all(
    //   productos.map(async (producto) => {
    //     producto.Imagen = await this.imageHelperService.getPresignedImageUrl(producto.Imagen);
    //     return producto;
    //   }),
    // );
    // return productosConImagenes;
  }

  async findOne(id: string) {
    const producto = await this.productoModel.findById(id).populate('Imagen').exec();
    producto.Imagen = await this.imageHelperService.getPresignedImageUrl(producto.Imagen);
    return producto;
  }

  update(id: number, updateProductoDto: UpdateProductoDto) {
    return `This action updates a #${id} producto`;
  }

  remove(id: number) {
    return `This action removes a #${id} producto`;
  }
}

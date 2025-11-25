import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { ProductoService } from './producto.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('producto')
export class ProductoController {
  constructor(private readonly productoService: ProductoService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpg|jpeg)' }),
          new MaxFileSizeValidator({
            maxSize: 5 * 1024 * 1024,
            message: 'File too large. Max size is 5MB',
          }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Body() createProductoDto: CreateProductoDto
  ) {
    const { Nombre, Descripcion, Precio, Imagen, Valoracion, stock } =
      createProductoDto;
    return this.productoService.create({
      Nombre,
      Descripcion,
      Precio:  typeof Precio === 'string' ? parseFloat(Precio) : Precio,
      Imagen,
      Valoracion: typeof Valoracion === 'string' ? parseFloat(Valoracion) : Valoracion,
      stock: typeof stock === 'string' ? parseInt(stock) : stock,
    }, file);
  }

  @Get()
  findAll() {
    console.log("AAAAA");
    return this.productoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductoDto: UpdateProductoDto,
  ) {
    return this.productoService.update(+id, updateProductoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productoService.remove(+id);
  }
}

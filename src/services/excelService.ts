import * as XLSX from 'xlsx';
import { Product } from '../types';

export interface ExcelImportResult {
  success: boolean;
  products: Product[];
  errors: string[];
  warnings: string[];
}

export interface ExcelTemplateColumn {
  header: string;
  key: keyof Product | 'categoryName';
  required: boolean;
  type: 'string' | 'number' | 'boolean';
  example?: string;
}

// Definición de columnas del template
export const EXCEL_TEMPLATE_COLUMNS: ExcelTemplateColumn[] = [
  { header: 'Producto', key: 'name', required: true, type: 'string', example: 'Producto Ejemplo' },
  { header: 'Codigo', key: 'code', required: true, type: 'string', example: 'PROD001' },
  { header: 'SKU', key: 'sku', required: false, type: 'string', example: 'SKU001' },
  { header: 'Unidad de Medida', key: 'unit', required: false, type: 'string', example: 'unit' },
  { header: 'Costo', key: 'cost', required: false, type: 'number', example: '15.00' },
  { header: 'Precio', key: 'price', required: true, type: 'number', example: '25.50' },
  { header: 'Porcentaje Ganancia', key: 'profitMargin', required: false, type: 'number', example: '70' },
  { header: 'Impuesto', key: 'tax', required: false, type: 'number', example: '13' },
  { header: 'Precio Incluye Impuesto', key: 'isTaxInclusivePrice', required: false, type: 'boolean', example: 'FALSE' },
  { header: 'Permitir Cambio Precio', key: 'isPriceChangeAllowed', required: false, type: 'boolean', example: 'TRUE' },
  { header: 'Usar Cantidad Por Defecto', key: 'isUsingDefaultQuantity', required: false, type: 'boolean', example: 'TRUE' },
  { header: 'Es Servicio', key: 'isService', required: false, type: 'boolean', example: 'FALSE' },
  { header: 'Habilitado', key: 'isEnabled', required: false, type: 'boolean', example: 'TRUE' },
  { header: 'Stock', key: 'stock', required: true, type: 'number', example: '100' },
  { header: 'Minimo', key: 'minStock', required: false, type: 'number', example: '10' },
  { header: 'Maximo', key: 'maxStock', required: false, type: 'number', example: '500' },
  { header: 'Cantidad', key: 'quantity', required: false, type: 'number', example: '1' },
  { header: 'Categoria', key: 'categoryName', required: true, type: 'string', example: 'Electrónicos' },
  { header: 'Descripcion', key: 'description', required: false, type: 'string', example: 'Descripción del producto' },
  { header: 'Activo', key: 'active', required: false, type: 'boolean', example: 'TRUE' }
];

class ExcelService {
  /**
   * Exporta productos a un archivo Excel
   */
  exportProductsToExcel(products: Product[], filename: string = 'inventario'): void {
    try {
      // Preparar datos para Excel
      const excelData = products.map(product => ({
        'Código': product.code,
        'Nombre': product.name,
        'Descripción': product.description || '',
        'Precio': product.price,
        'Stock': product.stock,
        'Stock Mínimo': product.minStock || 0,
        'Categoría': product.category,
        'Activo': product.active ? 'SÍ' : 'NO',
        'Imagen URL': product.image || '',
        'Fecha Creación': product.createdAt ? new Date(product.createdAt).toLocaleDateString() : '',
        'Última Actualización': product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : ''
      }));

      // Crear workbook y worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Configurar ancho de columnas
      const colWidths = [
        { wch: 12 }, // Código
        { wch: 25 }, // Nombre
        { wch: 30 }, // Descripción
        { wch: 10 }, // Precio
        { wch: 8 },  // Stock
        { wch: 12 }, // Stock Mínimo
        { wch: 15 }, // Categoría
        { wch: 8 },  // Activo
        { wch: 30 }, // Imagen URL
        { wch: 15 }, // Fecha Creación
        { wch: 18 }  // Última Actualización
      ];
      ws['!cols'] = colWidths;

      // Agregar worksheet al workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Inventario');

      // Generar y descargar archivo
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const finalFilename = `${filename}_${timestamp}.xlsx`;
      XLSX.writeFile(wb, finalFilename);

    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      throw new Error('Error al generar el archivo Excel');
    }
  }

  /**
   * Genera y descarga un template de Excel para importar productos
   */
  downloadTemplate(): void {
    try {
      // Crear datos de ejemplo usando las columnas definidas
      const exampleData = [
        {
          'Producto': 'Smartphone Samsung Galaxy',
          'Codigo': 'SAMS001',
          'SKU': 'SKU-SAMS-001',
          'Unidad de Medida': 'unit',
          'Costo': 150.00,
          'Precio': 255.00,
          'Porcentaje Ganancia': 70,
          'Impuesto': 13,
          'Precio Incluye Impuesto': 'FALSE',
          'Permitir Cambio Precio': 'TRUE',
          'Usar Cantidad Por Defecto': 'TRUE',
          'Es Servicio': 'FALSE',
          'Habilitado': 'TRUE',
          'Stock': 50,
          'Minimo': 5,
          'Maximo': 200,
          'Cantidad': 1,
          'Categoria': 'Electrónicos',
          'Descripcion': 'Smartphone con pantalla de 6.1 pulgadas',
          'Activo': 'TRUE'
        },
        {
          'Producto': 'Café Premium 500g',
          'Codigo': 'CAFE001',
          'SKU': 'SKU-CAFE-001',
          'Unidad de Medida': 'g',
          'Costo': 8.50,
          'Precio': 15.30,
          'Porcentaje Ganancia': 80,
          'Impuesto': 13,
          'Precio Incluye Impuesto': 'TRUE',
          'Permitir Cambio Precio': 'FALSE',
          'Usar Cantidad Por Defecto': 'TRUE',
          'Es Servicio': 'FALSE',
          'Habilitado': 'TRUE',
          'Stock': 100,
          'Minimo': 10,
          'Maximo': 500,
          'Cantidad': 1,
          'Categoria': 'Alimentos',
          'Descripcion': 'Café premium tostado artesanalmente',
          'Activo': 'TRUE'
        }
      ];

      // Crear workbook
      const wb = XLSX.utils.book_new();

      // Crear hoja de datos de ejemplo
      const wsData = XLSX.utils.json_to_sheet(exampleData);
      
      // Configurar anchos de columna basados en las columnas definidas
      const columnWidths = EXCEL_TEMPLATE_COLUMNS.map(col => {
        switch (col.type) {
          case 'boolean': return { wch: 12 };
          case 'number': return { wch: 10 };
          default: return { wch: col.header.length > 15 ? 20 : 15 };
        }
      });
      wsData['!cols'] = columnWidths;

      // Crear hoja de instrucciones
      const instructions = [
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': '' },
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': '═══════════════════════════════════════════════════════════════' },
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': '1. Complete los datos en la hoja "Datos"' },
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': '2. Los campos marcados con * son OBLIGATORIOS' },
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': '3. Use TRUE/FALSE para campos booleanos' },
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': '4. Los precios deben ser números decimales (ej: 25.50)' },
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': '5. El stock debe ser un número entero' },
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': '6. Guarde el archivo y súbalo al sistema' },
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': '' },
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': 'CAMPOS OBLIGATORIOS (*):' },
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': '• Producto * - Nombre del producto' },
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': '• Codigo * - Código único del producto' },
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': '• Precio * - Precio de venta' },
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': '• Stock * - Cantidad en inventario' },
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': '• Categoria * - Categoría del producto' },
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': '' },
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': 'UNIDADES DE MEDIDA DISPONIBLES:' },
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': '• unit (unidad) - Por defecto' },
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': '• kg (kilogramos)' },
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': '• g (gramos)' },
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': '• lb (libras)' },
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': '' },
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': 'CAMPOS BOOLEANOS (TRUE/FALSE):' },
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': '• Precio Incluye Impuesto - Si el precio ya incluye impuestos' },
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': '• Permitir Cambio Precio - Si se puede modificar el precio en venta' },
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': '• Usar Cantidad Por Defecto - Si usar cantidad predeterminada' },
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': '• Es Servicio - Si el producto es un servicio' },
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': '• Habilitado - Si el producto está habilitado' },
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': '• Activo - Si el producto está activo' },
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': '' },
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': 'NOTAS IMPORTANTES:' },
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': '• El Porcentaje Ganancia se calcula automáticamente si no se especifica' },
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': '• Si existe un producto con el mismo código, se actualizará' },
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': '• Los productos nuevos se crearán automáticamente' },
        { 'INSTRUCCIONES PARA USAR EL TEMPLATE DE INVENTARIO': '• Todos los campos opcionales tienen valores por defecto' }
      ];

      const wsInstructions = XLSX.utils.json_to_sheet(instructions);
      wsInstructions['!cols'] = [{ wch: 70 }];

      // Agregar hojas al workbook
      XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instrucciones');
      XLSX.utils.book_append_sheet(wb, wsData, 'Datos');

      // Descargar archivo
      const timestamp = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `template_inventario_completo_${timestamp}.xlsx`);

    } catch (error) {
      console.error('Error al generar template:', error);
      throw new Error('Error al generar el template de Excel');
    }
  }

  /**
   * Importa productos desde un archivo Excel
   */
  async importProductsFromExcel(file: File): Promise<ExcelImportResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Buscar la hoja de datos (puede ser "Datos" o la primera hoja)
          let sheetName = 'Datos';
          if (!workbook.Sheets[sheetName]) {
            sheetName = workbook.SheetNames[0];
          }
          
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const result = this.processExcelData(jsonData);
          resolve(result);

        } catch (error) {
          console.error('Error al procesar archivo Excel:', error);
          resolve({
            success: false,
            products: [],
            errors: ['Error al procesar el archivo Excel. Verifique que el formato sea correcto.'],
            warnings: []
          });
        }
      };

      reader.onerror = () => {
        resolve({
          success: false,
          products: [],
          errors: ['Error al leer el archivo'],
          warnings: []
        });
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Procesa los datos del Excel y los convierte a productos
   */
  private processExcelData(data: any[]): ExcelImportResult {
    const products: Product[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data || data.length === 0) {
      return {
        success: false,
        products: [],
        errors: ['El archivo está vacío o no contiene datos válidos'],
        warnings: []
      };
    }

    data.forEach((row, index) => {
      const rowNumber = index + 2; // +2 porque Excel empieza en 1 y tiene header
      
      try {
        // Validar campos obligatorios
        const name = this.cleanString(row['Producto'] || row['producto'] || row['Nombre'] || row['nombre'] || row['Name']);
        const code = this.cleanString(row['Codigo'] || row['codigo'] || row['Code']);
        const price = this.parseNumber(row['Precio'] || row['precio'] || row['Price']);
        const stock = this.parseNumber(row['Stock'] || row['stock']);
        const category = this.cleanString(row['Categoria'] || row['categoria'] || row['Category']);

        // Validaciones de campos obligatorios
        if (!name) {
          errors.push(`Fila ${rowNumber}: El nombre del producto es obligatorio`);
          return;
        }
        if (!code) {
          errors.push(`Fila ${rowNumber}: El código es obligatorio`);
          return;
        }
        if (price === null || price < 0) {
          errors.push(`Fila ${rowNumber}: El precio debe ser un número válido mayor o igual a 0`);
          return;
        }
        if (stock === null || stock < 0) {
          errors.push(`Fila ${rowNumber}: El stock debe ser un número válido mayor o igual a 0`);
          return;
        }
        if (!category) {
          errors.push(`Fila ${rowNumber}: La categoría es obligatoria`);
          return;
        }

        // Campos opcionales
        const sku = this.cleanString(row['SKU'] || row['sku']) || '';
        const unit = this.cleanString(row['Unidad de Medida'] || row['unidad_medida'] || row['Unit']) || 'unit';
        const cost = this.parseNumber(row['Costo'] || row['costo'] || row['Cost']) || 0;
        const profitMargin = this.parseNumber(row['Porcentaje Ganancia'] || row['porcentaje_ganancia'] || row['ProfitMargin']) || 0;
        const tax = this.parseNumber(row['Impuesto'] || row['impuesto'] || row['Tax']) || 0;
        const isTaxInclusivePrice = this.parseBoolean(row['Precio Incluye Impuesto'] || row['precio_incluye_impuesto'] || row['IsTaxInclusivePrice']);
        const isPriceChangeAllowed = this.parseBoolean(row['Permitir Cambio Precio'] || row['permitir_cambio_precio'] || row['IsPriceChangeAllowed']);
        const isUsingDefaultQuantity = this.parseBoolean(row['Usar Cantidad Por Defecto'] || row['usar_cantidad_defecto'] || row['IsUsingDefaultQuantity']);
        const isService = this.parseBoolean(row['Es Servicio'] || row['es_servicio'] || row['IsService']);
        const isEnabled = this.parseBoolean(row['Habilitado'] || row['habilitado'] || row['IsEnabled']);
        const minStock = this.parseNumber(row['Minimo'] || row['minimo'] || row['MinStock']) || 0;
        const maxStock = this.parseNumber(row['Maximo'] || row['maximo'] || row['MaxStock']) || 0;
        const quantity = this.parseNumber(row['Cantidad'] || row['cantidad'] || row['Quantity']) || 1;
        const description = this.cleanString(row['Descripcion'] || row['descripcion'] || row['Description']) || '';
        const active = this.parseBoolean(row['Activo'] || row['activo'] || row['Active']);

        // Validaciones adicionales
        if (tax < 0 || tax > 100) {
          warnings.push(`Fila ${rowNumber}: El impuesto debe estar entre 0 y 100%. Se usará 0%`);
        }
        if (minStock > stock) {
          warnings.push(`Fila ${rowNumber}: El stock mínimo (${minStock}) es mayor al stock actual (${stock})`);
        }
        if (maxStock > 0 && maxStock < stock) {
          warnings.push(`Fila ${rowNumber}: El stock máximo (${maxStock}) es menor al stock actual (${stock})`);
        }
        if (cost > 0 && cost > price) {
          warnings.push(`Fila ${rowNumber}: El costo (${cost}) es mayor al precio de venta (${price})`);
        }
        if (!['unit', 'kg', 'g', 'lb'].includes(unit)) {
          warnings.push(`Fila ${rowNumber}: Unidad de medida inválida (${unit}). Se usará 'unit'`);
        }
        if (profitMargin > 0 && cost > 0) {
          const calculatedMargin = ((price - cost) / cost) * 100;
          if (Math.abs(calculatedMargin - profitMargin) > 1) {
            warnings.push(`Fila ${rowNumber}: El porcentaje de ganancia calculado (${calculatedMargin.toFixed(1)}%) difiere del especificado (${profitMargin}%)`);
          }
        }

        // Crear producto
        const product: Product = {
          id: `import_${Date.now()}_${index}`,
          code: code.toUpperCase(),
          name,
          description,
          price,
          stock,
          minStock,
          maxStock: maxStock > 0 ? maxStock : undefined,
          cost: cost > 0 ? cost : undefined,
          costPrice: cost > 0 ? cost : undefined,
          sku: sku || undefined,
          tax: tax > 0 ? tax : undefined,
          taxRate: tax > 0 ? tax : undefined,
          unit: unit as Unit,
          profitMargin: profitMargin > 0 ? profitMargin : undefined,
          isTaxInclusivePrice,
          isPriceChangeAllowed,
          isUsingDefaultQuantity,
          isService,
          isEnabled,
          quantity: quantity > 0 ? quantity : 1,
          category,
          active,
          isActive: active,
          image: '', // Se puede agregar después si es necesario
          imageUrl: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        products.push(product);

        // Advertencias
        if (minStock > stock) {
          warnings.push(`Fila ${rowNumber}: El stock mínimo (${minStock}) es mayor al stock actual (${stock})`);
        }
        if (image && !this.isValidUrl(image)) {
          warnings.push(`Fila ${rowNumber}: La URL de imagen no parece válida`);
        }

      } catch (error) {
        errors.push(`Fila ${rowNumber}: Error al procesar los datos - ${error}`);
      }
    });

    return {
      success: errors.length === 0,
      products,
      errors,
      warnings
    };
  }

  // Utilidades
  private cleanString(value: any): string {
    if (value === null || value === undefined) return '';
    return String(value).trim();
  }

  private parseNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  private parseBoolean(value: any): boolean {
    if (value === null || value === undefined) return true;
    const str = String(value).toLowerCase().trim();
    return str === 'true' || str === '1' || str === 'sí' || str === 'si' || str === 'yes';
  }

  private isValidUrl(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }
}

export const generateImportTemplate = (): void => {
  const wb = XLSX.utils.book_new();
  
  // Crear hoja de instrucciones
  const instructionsData = [
    ['INSTRUCCIONES PARA IMPORTAR PRODUCTOS'],
    [''],
    ['1. Complete las columnas requeridas (marcadas con *)'],
    ['2. Las columnas opcionales pueden dejarse vacías'],
    ['3. Formatos de datos:'],
    ['   - Producto*: Nombre del producto (texto)'],
    ['   - Codigo*: Código único del producto (texto)'],
    ['   - SKU: Código SKU del producto (texto)'],
    ['   - Unidad de Medida: unit, kg, g, lb (por defecto: unit)'],
    ['   - Costo: Costo del producto (número decimal)'],
    ['   - Precio*: Precio de venta (número decimal, ej: 25.50)'],
    ['   - Porcentaje Ganancia: % de ganancia sobre el costo (número, ej: 70)'],
    ['   - Impuesto: Porcentaje de impuesto (número, ej: 13)'],
    ['   - Precio Incluye Impuesto: TRUE o FALSE'],
    ['   - Permitir Cambio Precio: TRUE o FALSE'],
    ['   - Usar Cantidad Por Defecto: TRUE o FALSE'],
    ['   - Es Servicio: TRUE o FALSE'],
    ['   - Habilitado: TRUE o FALSE'],
    ['   - Stock*: Cantidad en inventario (número entero)'],
    ['   - Minimo: Stock mínimo (número entero)'],
    ['   - Maximo: Stock máximo (número entero)'],
    ['   - Cantidad: Cantidad por defecto (número decimal)'],
    ['   - Categoria*: Nombre de la categoría (texto)'],
    ['   - Descripcion: Descripción del producto (texto)'],
    ['   - Activo: TRUE o FALSE (por defecto TRUE)'],
    [''],
    ['4. Si el código ya existe, se actualizará el producto'],
    ['5. Si el código no existe, se creará un nuevo producto'],
    [''],
    ['UNIDADES DE MEDIDA DISPONIBLES:'],
    ['unit (unidad), kg (kilogramo), g (gramo), lb (libra)'],
    [''],
    ['CATEGORÍAS DISPONIBLES:'],
    ['Electrónicos, Ropa, Hogar, Deportes, Libros, Juguetes, Salud, Belleza, Automóvil, Otros'],
    [''],
    ['NOTAS IMPORTANTES:'],
    ['- El Porcentaje Ganancia se calcula automáticamente si se proporciona Costo y Precio'],
    ['- Si Precio Incluye Impuesto es TRUE, el precio ya incluye el impuesto'],
    ['- Es Servicio indica si el producto es un servicio (no requiere stock físico)'],
    [''],
    ['* = Campo requerido']
  ];
  
  const instructionsWs = XLSX.utils.aoa_to_sheet(instructionsData);
  
  // Ajustar ancho de columnas para instrucciones
  instructionsWs['!cols'] = [{ wch: 80 }];
  
  // Crear hoja de template
  const headers = EXCEL_TEMPLATE_COLUMNS.map(col => 
    col.required ? `${col.header} *` : col.header
  );
  
  const exampleRow = EXCEL_TEMPLATE_COLUMNS.map(col => col.example);
  
  const templateData = [
    headers,
    exampleRow,
    // Agregar algunas filas vacías para facilitar la entrada de datos
    new Array(headers.length).fill(''),
    new Array(headers.length).fill(''),
    new Array(headers.length).fill('')
  ];
  
  const templateWs = XLSX.utils.aoa_to_sheet(templateData);
  
  // Configurar ancho de columnas para el template
  templateWs['!cols'] = EXCEL_TEMPLATE_COLUMNS.map(col => ({
    wch: Math.max(col.header.length + 2, 15)
  }));
  
  // Aplicar estilos a los encabezados (primera fila)
  const headerRange = XLSX.utils.decode_range(templateWs['!ref'] || 'A1');
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!templateWs[cellAddress]) continue;
    
    templateWs[cellAddress].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "366092" } },
      alignment: { horizontal: "center" }
    };
  }
  
  // Agregar hojas al libro
  XLSX.utils.book_append_sheet(wb, instructionsWs, 'Instrucciones');
  XLSX.utils.book_append_sheet(wb, templateWs, 'Productos');
  
  // Descargar archivo
  const fileName = `template_productos_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

export const excelService = new ExcelService();
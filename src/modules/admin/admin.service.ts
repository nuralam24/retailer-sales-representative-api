import { Injectable, BadRequestException } from '@nestjs/common';
import * as csvParser from 'csv-parser';
import { Readable } from 'stream';
import { RetailersService } from '../retailers/retailers.service';
import { CreateRetailerDto } from '../retailers/dto/create-retailer.dto';

export interface CsvImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}

@Injectable()
export class AdminService {
  constructor(private retailersService: RetailersService) {}

  async importRetailersFromCsv(file: Express.Multer.File): Promise<CsvImportResult> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (file.mimetype !== 'text/csv') {
      throw new BadRequestException('File must be a CSV');
    }

    const results: CreateRetailerDto[] = [];
    const errors: string[] = [];
    let rowNumber = 1;

    return new Promise((resolve, reject) => {
      const stream = Readable.from(file.buffer);

      stream
        .pipe(csvParser())
        .on('data', (row) => {
          rowNumber++;
          try {
            if (!row.uid || !row.name || !row.phone || !row.regionId || !row.areaId || !row.distributorId || !row.territoryId) {
              errors.push(`Row ${rowNumber}: Missing required fields`);
              return;
            }

            const retailer: CreateRetailerDto = {
              uid: row.uid.trim(),
              name: row.name.trim(),
              phone: row.phone.trim(),
              regionId: parseInt(row.regionId),
              areaId: parseInt(row.areaId),
              distributorId: parseInt(row.distributorId),
              territoryId: parseInt(row.territoryId),
              points: row.points ? parseInt(row.points) : 0,
              routes: row.routes || null,
              notes: row.notes || null,
            };

            if (isNaN(retailer.regionId) || isNaN(retailer.areaId) || isNaN(retailer.distributorId) || isNaN(retailer.territoryId)) {
              errors.push(`Row ${rowNumber}: Invalid numeric values`);
              return;
            }

            results.push(retailer);
          } catch (error) {
            errors.push(`Row ${rowNumber}: ${error.message}`);
          }
        })
        .on('end', async () => {
          try {
            let imported = 0;
            let failed = 0;

            const batchSize = 100;
            for (let i = 0; i < results.length; i += batchSize) {
              const batch = results.slice(i, i + batchSize);
              try {
                const result = await this.retailersService.bulkCreate(batch);
                imported += result.count;
              } catch (error) {
                failed += batch.length;
                errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
              }
            }

            resolve({
              success: true,
              imported,
              failed,
              errors: errors.slice(0, 50),
            });
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          reject(new BadRequestException(`CSV parsing error: ${error.message}`));
        });
    });
  }
}

import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminGuard, JwtAuthGuard } from 'src/auth/jwt.guard';
import { HttpErrorResponse } from 'src/utils/httpResponse.dto';
import { SmartContractAbiDTO, SmartContractBytecodeDTO } from './dto/smart-contract.dto';
import { SmartContractService } from './smart-contract.service';

@ApiTags('Smart Contract')
@Controller('smart-contract')
export class SmartContractController {
  constructor(private smartContractService: SmartContractService) {}

  @Post('abi')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: SmartContractAbiDTO })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Unable to upload ABI' })
  @UseGuards(AdminGuard)
  async uploadSmartContractABI(@Body() abiJson) {
    return this.smartContractService.uploadSmartContractABI(abiJson);
  }

  @Get('abi')
  @ApiOkResponse({ type: SmartContractAbiDTO })
  @ApiNotFoundResponse({ description: 'ABI not found' })
  async getSmartContractABI() {
    return this.smartContractService.getSmartContractABI();
  }

  @Post('bytecode')
  @ApiCreatedResponse({ type: SmartContractBytecodeDTO })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Unable to upload bytecode' })
  @UseGuards(AdminGuard)
  async uploadSmartContractBytecode(@Body() dto) {
    return this.smartContractService.uploadSmartContractBytecode(dto);
  }

  @Get('bytecode')
  @ApiOkResponse({ type: SmartContractBytecodeDTO })
  @ApiNotFoundResponse({ description: 'ABI not found' })
  async getSmartContractBytecode() {
    return this.smartContractService.getSmartContractBytecode();
  }
}

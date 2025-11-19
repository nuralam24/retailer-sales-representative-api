import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../src/modules/auth/auth.service';
import { SalesRepsService } from '../src/modules/sales_rep_retailers/sales-reps.service';
import { UserRole } from '../src/modules/sales_rep_retailers/dto/create-sales-rep.dto';

describe('AuthService', () => {
  let service: AuthService;
  let salesRepsService: SalesRepsService;
  let jwtService: JwtService;

  const mockSalesRepsService = {
    findByUsername: jest.fn(),
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: SalesRepsService, useValue: mockSalesRepsService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    salesRepsService = module.get<SalesRepsService>(SalesRepsService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return access token for valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        id: 1,
        username: 'karim_ahmed',
        name: 'Karim Ahmed',
        role: UserRole.SALES_REP,
        passwordHash: hashedPassword,
      };

      mockSalesRepsService.findByUsername.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.login({
        username: 'karim_ahmed',
        password: 'password123',
      });

      expect(result).toEqual({
        access_token: 'mock-jwt-token',
        user: {
          id: 1,
          username: 'karim_ahmed',
          name: 'Karim Ahmed',
          role: UserRole.SALES_REP,
        },
      });
      expect(mockSalesRepsService.findByUsername).toHaveBeenCalledWith('karim_ahmed');
      expect(mockJwtService.sign).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid username', async () => {
      mockSalesRepsService.findByUsername.mockResolvedValue(null);

      await expect(
        service.login({ username: 'invalid', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const hashedPassword = await bcrypt.hash('correct', 10);
      const mockUser = {
        id: 1,
        username: 'karim_ahmed',
        passwordHash: hashedPassword,
        role: UserRole.SALES_REP,
      };

      mockSalesRepsService.findByUsername.mockResolvedValue(mockUser);

      await expect(
        service.login({ username: 'karim_ahmed', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return user for valid userId', async () => {
      const mockUser = {
        id: 1,
        username: 'karim_ahmed',
        name: 'Karim Ahmed',
        role: UserRole.SALES_REP,
      };

      mockSalesRepsService.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser(1);

      expect(result).toEqual(mockUser);
      expect(mockSalesRepsService.findOne).toHaveBeenCalledWith(1);
    });
  });
});


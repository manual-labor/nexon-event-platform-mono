import { applyDecorators, BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';

export function TransformDate() {
  return applyDecorators(
    Transform(
      ({ value }) => {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          throw new BadRequestException('Invalid date format');
        }
        return date;
      },
      { toClassOnly: true },
    ),
  );
}

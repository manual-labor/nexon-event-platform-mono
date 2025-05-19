# NexonEventPlatformMono

## 목차

- [프로젝트 소개](#프로젝트-소개)
- [환경 변수](#환경-변수)
- [빌드-및-실행](#빌드-및-실행)
- [API-목록](#api-목록)

## 프로젝트 소개

이 프로젝트는 넥슨의 이벤트 보상 플랫폼을 NestJS 기반의 마이크로서비스 아키텍처(MSA)로 구현한 과제입니다. Nx 모노레포 구조를 채택하여 여러 서비스를 효율적으로 관리하며, API 게이트웨이를 통해 모든 외부 요청을 처리하고 중앙에서 인증 및 권한 제어를 수행합니다.

**주요 설계 및 아키텍처:**

*   **모노레포 (Nx):** API 게이트웨이, 인증 서비스, 이벤트 서비스를 단일 저장소에서 관리하여 코드 공유, 일관된 개발 환경 및 빌드/테스트 프로세스를 제공합니다.
*   **마이크로서비스 아키텍처 (MSA):**
    *   **인증 서비스 (Auth Service):** 사용자 회원가입, 로그인, JWT 토큰 기반 인증 및 사용자 정보 관리를 담당합니다.
    *   **이벤트 서비스 (Event Service):** 이벤트 생성, 조회, 참여, 보상 지급 등 이벤트 관련 로직을 처리합니다.
    *   각 서비스는 독립적으로 개발, 배포, 확장이 가능하며, 서비스 간 통신은 NestJS 마이크로서비스 패턴(TCP)을 사용합니다.
*   **API 게이트웨이 (Gateway Service):**
    *   클라이언트 요청의 단일 진입점(Single Point of Entry) 역할을 수행합니다.
    *   요청 라우팅, 중앙 집중식 인증(JWT) 및 인가 처리를 담당합니다.
    *   Swagger를 통해 API 문서를 통합적으로 제공합니다.
*   **기술 스택:**
    *   **NestJS (Node.js, TypeScript):** 모든 서비스 개발에 사용되어 구조적이고 확장 가능한 백엔드 시스템을 구축합니다.
    *   **MongoDB:** 사용자 데이터와 이벤트 관련 데이터를 유연하게 저장하며, Replica Set으로 구성하여 데이터 가용성을 확보합니다.
    *   **Redis:** 세션 관리 또는 캐싱 목적으로 활용될 수 있습니다.
    *   **Docker / Docker Compose:** 개발 및 배포 환경의 일관성을 보장하고 서비스 관리를 용이하게 합니다.

**본 설계의 주요 장점:**

*   **모듈성 및 확장성:** 각 마이크로서비스는 독립적으로 개발 및 배포될 수 있으며, 특정 서비스에 대한 요구사항 증가 시 해당 서비스만 선택적으로 확장할 수 있습니다.
*   **유지보수 용이성:** 서비스별로 코드가 분리되어 있어 이해와 수정이 용이하며, 변경 사항이 다른 서비스에 미치는 영향을 최소화합니다.
*   **개발 생산성:** Nx 모노레포 환경은 코드 재사용성을 높이고, NestJS는 빠른 개발과 강력한 기능을 지원하여 전반적인 개발 효율을 증진시킵니다.
*   **안정성 및 장애 격리:** 한 서비스의 장애가 전체 시스템의 중단으로 이어지는 것을 방지하고, 장애 범위를 해당 서비스로 국한시켜 시스템 전체의 안정성을 높입니다.
*   **중앙화된 요청 처리 및 보안:** API 게이트웨이를 통해 모든 요청을 일관되게 관리하고, 보안 정책을 중앙에서 적용하여 안전한 시스템 운영을 지원합니다.

## 환경 변수

주요 환경 변수는 다음과 같습니다. (실제 프로젝트에 맞게 수정 필요)

```
# .env

# 공통 환경 변수
NODE_ENV=development
JWT_SECRET="your-super-secret-jwt-key" # 예시, 실제 서비스에서 변경 필요

# API Gateway 서비스 (gateway_service)
GATEWAY_PORT=3000
AUTH_SERVICE_HOST=auth_service # Docker 내부 호스트명, 로컬 실행 시 localhost 등
AUTH_SERVICE_PORT=3001
EVENT_SERVICE_HOST=event_service # Docker 내부 호스트명, 로컬 실행 시 localhost 등
EVENT_SERVICE_PORT=3002
INTERNAL_API_KEY="your-internal-api-key" # 내부 서비스 간 인증 키 예시, 실제 서비스에서 변경 필요

# 인증 서비스 (auth_service)
AUTH_PORT=3001
MONGODB_URI_AUTH="mongodb://mongo1:27017,mongo2:27017,mongo3:27017/authdb?replicaSet=rs0"
# 로컬 단일 인스턴스 예시: MONGODB_URI_AUTH="mongodb://localhost:27017/authdb"

# 이벤트 서비스 (event_service)
EVENT_PORT=3002
MONGODB_URI_EVENT="mongodb://mongo1:27017,mongo2:27017,mongo3:27017/eventdb?replicaSet=rs0"
# 로컬 단일 인스턴스 예시: MONGODB_URI_EVENT="mongodb://localhost:27017/eventdb"

# Redis (auth_service, event_service 등에서 공통 사용)
REDIS_HOST=redis # Docker 내부 호스트명, 로컬 실행 시 localhost 등
REDIS_PORT=6379

## 빌드 및 실행

### Docker 사용 (권장)

프로젝트 루트 디렉토리에서 다음 명령어를 실행하여 모든 서비스를 Docker 컨테이너로 실행합니다.

```bash
docker-compose up -d --build
```

서비스 종료는 다음 명령어를 사용합니다.

```bash
docker-compose down
```

### Docker를 사용한 개별 서비스 실행

Docker를 사용하여 각 서비스를 개별적으로 시작할 수 있습니다. (모든 서버를 함께 시작하려면 `docker-compose up -d --build`를 사용하시면 됩니다.)

**개별 서비스 시작 (Docker):**
-   **인증 서비스**: `docker-compose up -d auth_service`
-   **이벤트 서비스**: `docker-compose up -d event_service`
-   **API 게이트웨이**: `docker-compose up -d gateway_service`

    *참고: 특정 서비스를 시작하기 전에 `mongo-init` 및 `redis`와 같은 의존성 서비스가 먼저 실행되어야 할 수 있습니다. `docker-compose up -d <service_name>` 명령어는 해당 서비스의 의존성도 함께 시작합니다.*

### 로컬 직접 빌드 (pnpm 사용)

pnpm을 사용하여 각 서비스를 개별적으로 빌드할 수 있습니다. (pnpm 이 설치되어 있어야 합니다.)

**서비스 빌드:**

-   **인증 서비스**: `pnpm build:auth`
-   **이벤트 서비스**: `pnpm build:event`
-   **API 게이트웨이**: `pnpm build:gateway`

전체 프로젝트 빌드: `pnpm build`

## API 목록

이 프로젝트의 API는 Swagger를 사용하여 문서화되어 있습니다. 게이트웨이 주소를 통해 접근할 수 있습니다.

**Swagger API 문서 접근:**

-   **URL**: `http://localhost:{GATEWAY_PORT}/v1/api-docs`
    -   기본 게이트웨이 포트(3000) 사용 시: `http://localhost:3000/v1/api-docs`
-   Swagger UI를 통해 각 API 엔드포인트의 상세 정보(요청/응답 형식, 파라미터, 권한 등)를 확인하고 직접 테스트해볼 수 있습니다.
    -   API 호출 시 필요한 인증 토큰은 로그인 API를 통해 얻은 후, Swagger UI 우측 상단의 "Authorize" 버튼을, 혹은 각 API 오른쪽 잠금 이미지를 클릭하여 `Bearer Token` 형태로 입력하면 됩니다.

**주요 API:**

*   **인증 서비스 (Auth Service):**

    | 작업 (Operation)        | HTTP 메소드 | API 주소 (경로)                 | 권한 (필요 시) |
    | :------------------------ | :---------- | :------------------------------ | :------------- |
    | 로그인                    | `POST`      | `/v1/auth/login`                | Public         |
    | 회원가입                  | `POST`      | `/v1/auth/register`             | Public         |
    | 토큰 검증                 | `POST`      | `/v1/auth/validate`             | Public         |
    | 현재 사용자 프로필 조회    | `GET`       | `/v1/auth/profile`              | USER  |
    | 특정 사용자 프로필 조회    | `GET`       | `/v1/auth/profile/:id`          | USER  |
    | 사용자 목록 조회          | `GET`       | `/v1/auth/users`                | ADMIN, OPERATOR|
    | 사용자 정보 수정          | `PUT`       | `/v1/auth/users/:id`            | ADMIN, OPERATOR|
    | 사용자 역할 수정          | `PUT`       | `/v1/auth/users/:id/role`       | ADMIN, OPERATOR|
    | 이메일로 사용자 조회      | `GET`       | `/v1/auth/users/by-email/:email`| ADMIN, OPERATOR|

*   **이벤트 서비스 (Event Service):**

    | 작업 (Operation)            | HTTP 메소드 | API 주소 (경로)                               | 권한 (필요 시) |
    | :---------------------------- | :---------- | :-------------------------------------------- | :------------- |
    | 이벤트 목록 조회              | `GET`       | `/v1/event`                                   | USER  |
    | 이벤트 상세 조회              | `GET`       | `/v1/event/:eventId`                          | USER  |
    | 이벤트 생성                   | `POST`      | `/v1/event`                                   | ADMIN, OPERATOR|
    | 이벤트 수정                   | `PUT`       | `/v1/event/:eventId`                          | ADMIN, OPERATOR|
    | 보상 생성                     | `POST`      | `/v1/event/:eventId/rewards`                  | ADMIN, OPERATOR|
    | 보상 수정                     | `PUT`       | `/v1/event/:eventId/rewards/:rewardId`        | ADMIN, OPERATOR|
    | 이벤트 보상 목록 조회         | `GET`       | `/v1/event/:eventId/rewards`                  | USER  |
    | 보상 수령 내역 상태 수정      | `PATCH`     | `/v1/event/rewards/history/:historyId/status` | ADMIN, OPERATOR|
    | 보상 수령 내역 조회           | `GET`       | `/v1/event/rewards/history`                   | USER<sup>\*</sup> |
    | 친구 초대                     | `POST`      | `/v1/event/participation/invite-friends`      | USER, ADMIN    |
    | 출석 체크                     | `POST`      | `/v1/event/participation/check-attendance`    | USER, ADMIN    |
    | 이벤트 보상 요청              | `POST`      | `/v1/event/participation/:eventId/rewards/:rewardId/claim` | USER, ADMIN    |

    <sup>\*</sup> 일반 사용자는 자신의 내역만 조회 가능. ADMIN/OPERATOR/AUDITOR는 `userId` 쿼리 파라미터를 통해 특정 사용자의 내역 조회 가능.

*각 서비스의 구체적인 API 명세는 해당 서비스의 Swagger 문서를 참고해주시면 됩니다.*


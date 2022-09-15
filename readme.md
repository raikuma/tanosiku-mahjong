# 웹 마작 게임 기획 :mahjong:

만들자, 게임!

[TOC]

## 기본정보

제목: 타노시쿠 마장 (Tanosiku Mahjong)

장르: 보드게임 (마작)

플랫폼: 웹 (Node JS)

## 컨셉

미정

## 페이지 구성

1. 메인 (index)
   - 타이틀 로고
   - 닉네임 입력란
   - 접속 버튼
   - 하단 게임 정보
2. 로비 (lobby)
   - 방
   - 캐릭터
3. 게임방 (game/방넘버)
   - 게임 정보 (가운데)
   - 플레이어 정보
   - 버림패
   - 손패
   - 운패

## 기능

#### 메인 (index)

- 닉네임 설정 후 입장 :heavy_check_mark:

#### 로비 (lobbgy)

- 방탐색 :heavy_check_mark:
  - 방이름 ​:heavy_check_mark:​
  - 비밀방 여부 ​:heavy_check_mark:​
  - 현재 입장한 인원 수 :heavy_check_mark:
- 새로운 방 만들기 (비밀방 가능) ​:heavy_check_mark:​
  - 방 이름 ​:heavy_check_mark:​
  - 비밀번호 (옵션) ​:heavy_check_mark:​
- 본인 정보 확인 ​:heavy_check_mark:​

#### 게임 (game/방넘버)

- 마작의 기본 기능 - 4인 리치 마작
  - 패산 쌓기 ​:heavy_check_mark:​
  - 주사위 굴리기 ​:heavy_check_mark:​
  - 동서남북 정하기 ​:heavy_check_mark:​
  - 왕패 떼기 ​:heavy_check_mark:​
  - 손패 떼기 ​:heavy_check_mark:​
  - 쯔모, 기리 ​:heavy_check_mark:​
  - 치, 퐁, 깡 ​:heavy_check_mark:​
  - 도라 뒤집기 ​:heavy_check_mark:​
  - 영상패 쯔모 ​:heavy_check_mark:​
  - 론(챵깡), 쯔모 ​:heavy_check_mark:​
  - 점수 계산 ​:heavy_check_mark:​
  - 점수 이동 ​:heavy_check_mark:​
  - 현재 정보
    - 남은 패 수 ​:heavy_check_mark:​
    - 손패 ​:heavy_check_mark:​
    - 점수, 가(家) ​:heavy_check_mark:​
  - 연장 기능 ​:heavy_check_mark:​
- 추가 기능
  - 버린패 확인 ​:heavy_check_mark:​
  - 샹텐 확인 기능
  - 쯔모 기리 확인 기능 :heavy_check_mark:
  - CPU 대전


- 게임 외 본인 정보
  - 닉네임
  - 프로필 사진 (우선 기본 이미지 중 선택) :heavy_check_mark:
- 게임 옵션
  - 사운드 조절
  - 방 나가기
  - 추가 기능 설정

## 개발 계획

|          날짜 | 작업                           |
| ----------: | :--------------------------- |
| 1.25 - 1.26 | 기본 구조 구상 및 정리                |
|        1.26 | 서버 준비                        |
|        1.27 | 메인 페이지                       |
| 1.28 - 1.29 | 로비 페이지                       |
| 1.30 - 1.31 | 마작 기본기능 클래스 구현               |
|         2.1 | 게임 페이지 UI 구성, *남은 마작 클래스 구현* |
|   2.2 - 2.3 | UI - 기능 연결, *남은 마작 클래스 구현*   |
|   2.4 - 2.7 | 게임방 네트워크 작업, *남은 마작 클래스 구현*  |
|  2.8 - 2.10 | UI 디자인 및 다듬기                 |
| 2.11 - 2.13 | 기타 추가 기능 구현                  |
| 2.14 - 2.17 | 테스팅 및 디버그                    |
|    **2.18** | **런칭일**                      |

## 유저 시나리오

1. 메인 페이지 진입 :heavy_check_mark:
2. 타이틀 로고가 짠!
3. 아래 닉네임적고 입장 :heavy_check_mark:
4. 로비에서 방 확인 :heavy_check_mark:
5. 방 누르고 입장 (필요시 비밀번호) :heavy_check_mark:
6. 게임 페이지에서 마작 진행
7. 게임 끝나면 결과 확인 후 퇴장
8. 4에서 다시 루프
9. 캐릭터 설정

## 클래스

#### 마작 관련 (Mahjong.js)

- `GameManager`: 전체 돌아가는 판 관리
  - `Player`: 작사 클래스, 점수, 손패등 관리
    - `Hands`: 손패 클래스
  - `Mount`: 패산 클래스 (왕패도 관리)

#### 게임 외 (Etc.js)

- `LobbyManager`: 방 관리
  - `Room`: 각각의 방


- `GameSetting`: 게임 설정

## 구현 시 참고 사항

- 비밀방 기능은 쿠키를 사용. 올바른 비밀번호 입력시 쿠키로 방 넘버 반환. 링크를 통한 접속 시에도 쿠키를 검사하여 정상적이지 않은 경우 입장 불가
- 기본적인 게임 처리는 모두 서버에서 처리. 웹 브라우저 조작을 통한 해킹 방지
- 사용 API
  - `Express`: 웹 페이지
  - `socket.io`: 네트워크
  - `Bootstrap`
  - `jQuery`
  - `iconSelecet.js`
  - `jQuery-Cookie`
- 클래스 구현 시 `module.exports` 구조로 통일
- 족보 영어 이름
  - 천화 - chunhwa
  - 지화 - jihwa
  - 사안커 - sanan
  - 국사무쌍 - guksa
  - 13면 국사무쌍 - 13guksa
  - 구련보등 - guryun
  - 순정구련보등 - sunguryun
  - 녹일색 - nok
  - 자일색 - ja
  - 대삼원 - deasam
  - 소사희 - sosa
  - 대사희 - deasa
  - 사깡즈 - sakang
  - 인화
  - 유국만관
  - 멘젠쯔모 - mjtsumo
  - 리치 - rich
  - 일발 - ilbal
  - 핑후 - pinghu
  - 이페코 - ipeco
  - 량페코 - rypeco
  - 더블리치 - dbrich
  - 칠대자 - chitoi
  - 삼색동순 - dongsun
  - 일기통관 - ilgi
  - 챤타 - chanta
  - 준챤타 - jchanta
  - 혼일색 - hon
  - 삼원패 - bak, bal, chu
  - 자풍패 - japung
  - 장풍패 - jangpung
  - 연풍패 - yunpung
  - 탕야오 - tang
  - 영상개화 - youngsang
  - 챵깡
  - 해저로월 - rowall
  - 하저로어 - rower
  - 또이또이 - toitoi
  - 삼안커 - saman
  - 삼색동각 - donggak
  - 소삼원 - sosam
  - 혼노두 - honnodu
  - 삼깡즈 - samkang
  - 청일색 - chung

## 네트워크 통신

#### 메인

- 접속 버튼 클릭시 로비로 이동할 때 아이디를 세션에 저장
- 만약 세션 정보가 존재하면 아이디 자동 입력

#### 로비

- 세션에 저장된 아이디를 받아서 캐릭터 정보 출력
- `connect`: 방 정보 전달
- `lobbyInfo`: 주기적으로 로비의 방들 정보 전달
- `roomInfo`: 방 클릭시 방 정보 전달
- `enterRoom`: 정상적으로 접속 성공시 전달, 게임 페이지로 이동

#### 게임

- `playerEnter/Quit`: 플레이어 입퇴장
- `playState`: 게임의 진행 상황을 서버에서 전달 (플레이어 마다 다르게 전달)
- `playerAction`: 플레이어의 행동을 서버로 전달

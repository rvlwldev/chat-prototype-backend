## Channel  

### POST : domain/{channelId}/
#### _@Return_ - 채널정보 (Object)
- id : 채널 ID
- name : 채널 이름
- type : 채널 타입

### POST : domain/{channelId}/users/
#### _@body_ - users: 유저ID (Array) 또는 단건 유저ID (String)
#### _@Return_ - 유저ID (Array) 

### GET : domain/channels/{channelId}
#### _@Return_ - 채널정보 (Object)
- id : 채널 ID
- name : 채널 이름
- type : 채널 타입

### GET : domain/channels/{channelId}/users
#### _@Return_ - 유저ID (Array)

 


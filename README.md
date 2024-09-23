# Startup Specs


## Elevator Pitch
Imagine a place where cherished memories of a loved one are preserved and shared during their funeral. Our platform allows friends and family to easily add photos, stories, and heartfelt messages for the deceased, creating a collective tribute that can be viewed during the funeral and in the days following. Afterward, these precious memories will be securely uploaded to FamilySearch, ensuring they live on for generations. 

## Key Features
 - login screen
 - login as admin (using a familysearch login - this will later be used to upload all memories)
 - login using a funeral key (to allow you to view and add memories to the deceased person's memorial)
 - add memories (text, audio files, photos, etc) for deceased person
 - view memories submitted by others (on a wall and each individual memory)
 - at end of funeral, upload all memories to familySearch

## Technologies
HTML - display and organize text throughout the interface
CSS - styling for memories, log-in, interact with others' memories, etc
JavaScript - Provides login, add memories, view other memories
React - Using framework to 
Service - Backend service with endpoints for:
retrieving memories
submitting memories
DB/Login - Store users and memories in database. Register and login users (familysearch auth) store auth for pushing memories to familysearch. Can't add memories without group authorization key
WebSocket - As a memory is added, visible on funeral wall to all other users.

## Design Image

![Startup Design](./startup-specs-images/IMG_8197.jpg)

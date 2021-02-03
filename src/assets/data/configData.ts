 export const pageConfig = {
   "fieldMappings": {
     "icon": "icon",
     "logo": "logo",
     "summary": "summary",
     "description": "description",
     "video": "video-url",
     "images": "images",
     "categories": "categories",
     "author": "author",
     "gallery": "gallery"
   },
   "appListPage": [
     {
       "name": "Your App Store Platform",
       "description": "A design template for implementing your app store with OpenChannel",
       "type": "search"
     },
     {
       "name": "Featured",
       "description": "",
       "type": "featured-apps",
       "filter": "{\"attributes.featured\": \"yes\"}",
       "filterId": "collections",
       "valueId": "featured",
       "sort": "{randomize: 1}"
     },
     {
       "name": "Recently Added",
       "description": "The latest apps that help you and your team work and build faster",
       "type": "apps-list",
       "filterId": "collections",
       "valueId": "newest",
       "filter": "{\"status.value\":\"approved\"}",
       "sort": "{created: -1}"
     },
     {
       "name": "Most Popular",
       "description": "The most used apps that help you and your team get more done",
       "type": "apps-list",
       "filterId": "collections",
       "valueId": "popular",
       "filter": "{\"status.value\":\"approved\"}",
       "sort": "{popular: 1}"
     },
     {
       "name": "Apps for Analytics",
       "description": "The latest apps that help you and your team work and build faster",
       "type": "apps-list",
       "filterId": "categories",
       "valueId": "analytics",
       "filter": "{\"status.value\":\"approved\",\"customData.categories\":\"Analytics\"}",
       "sort": "{created: -1}"
     }
   ]
 }

#!/bin/bash

# Event API Test Script
# Test all the fixes for gallery images and slug handling

BASE_URL="http://localhost:5000/api/v1/events"

echo "🧪 Testing Event API Fixes..."
echo "================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

echo -e "${YELLOW}1. Testing GET by invalid slug (should return 404, not 500)${NC}"
response=$(curl -s -w "%{http_code}" -o /tmp/response.json "$BASE_URL/euhbubf")
if [ "$response" = "404" ]; then
    print_result 0 "GET by invalid slug returns 404 (not 500)"
    cat /tmp/response.json | jq '.'
else
    print_result 1 "GET by invalid slug returned $response instead of 404"
fi

echo -e "\n${YELLOW}2. Creating event with 3 gallery images using different field names${NC}"
create_response=$(curl -s -w "%{http_code}" -o /tmp/create_response.json \
  -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Event Gallery",
    "description": "Test event with gallery images",
    "eventDate": "2026-03-25",
    "eventTime": "10:00:00",
    "location": "Test Location",
    "organizerName": "Test Organizer",
    "status": "upcoming",
    "galleryImages": [
      "uploads/events/test1.jpg",
      "uploads/events/test2.jpg",
      "uploads/events/test3.jpg"
    ]
  }')

if [ "$create_response" = "201" ]; then
    print_result 0 "Event created successfully"
    event_id=$(cat /tmp/create_response.json | jq -r '.data.id')
    event_slug=$(cat /tmp/create_response.json | jq -r '.data.slug')
    gallery_count=$(cat /tmp/create_response.json | jq -r '.data.galleryImages | length')
    echo "Event ID: $event_id"
    echo "Event Slug: $event_slug"
    echo "Gallery Images Count: $gallery_count"
    
    if [ "$gallery_count" = "3" ]; then
        print_result 0 "Gallery images saved correctly (3 images)"
    else
        print_result 1 "Gallery images count mismatch: expected 3, got $gallery_count"
    fi
else
    print_result 1 "Event creation failed with status $create_response"
    cat /tmp/create_response.json | jq '.'
fi

echo -e "\n${YELLOW}3. Testing GET by ID${NC}"
if [ ! -z "$event_id" ]; then
    get_response=$(curl -s -w "%{http_code}" -o /tmp/get_response.json "$BASE_URL/$event_id")
    if [ "$get_response" = "200" ]; then
        print_result 0 "GET by ID successful"
        get_gallery_count=$(cat /tmp/get_response.json | jq -r '.data.galleryImages | length')
        if [ "$get_gallery_count" = "3" ]; then
            print_result 0 "Gallery images preserved in GET by ID"
        else
            print_result 1 "Gallery images count mismatch in GET by ID: expected 3, got $get_gallery_count"
        fi
    else
        print_result 1 "GET by ID failed with status $get_response"
    fi
fi

echo -e "\n${YELLOW}4. Testing GET by slug${NC}"
if [ ! -z "$event_slug" ]; then
    slug_response=$(curl -s -w "%{http_code}" -o /tmp/slug_response.json "$BASE_URL/$event_slug")
    if [ "$slug_response" = "200" ]; then
        print_result 0 "GET by slug successful"
        slug_gallery_count=$(cat /tmp/slug_response.json | jq -r '.data.galleryImages | length')
        if [ "$slug_gallery_count" = "3" ]; then
            print_result 0 "Gallery images preserved in GET by slug"
        else
            print_result 1 "Gallery images count mismatch in GET by slug: expected 3, got $slug_gallery_count"
        fi
    else
        print_result 1 "GET by slug failed with status $slug_response"
    fi
fi

echo -e "\n${YELLOW}5. Testing update with 2 more gallery images using different field names${NC}"
if [ ! -z "$event_id" ]; then
    update_response=$(curl -s -w "%{http_code}" -o /tmp/update_response.json \
      -X PUT "$BASE_URL/$event_id" \
      -H "Content-Type: application/json" \
      -d '{
        "title": "Updated Test Event",
        "gallery": [
          "uploads/events/test4.jpg",
          "uploads/events/test5.jpg"
        ]
      }')
    
    if [ "$update_response" = "200" ]; then
        print_result 0 "Event updated successfully"
        update_gallery_count=$(cat /tmp/update_response.json | jq -r '.data.galleryImages | length')
        if [ "$update_gallery_count" = "5" ]; then
            print_result 0 "Gallery images updated correctly (now 5 images)"
        else
            print_result 1 "Gallery images count mismatch after update: expected 5, got $update_gallery_count"
        fi
    else
        print_result 1 "Event update failed with status $update_response"
    fi
fi

echo -e "\n${YELLOW}6. Testing duplicate slug (should return 409)${NC}"
duplicate_response=$(curl -s -w "%{http_code}" -o /tmp/duplicate_response.json \
  -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Another Test Event",
    "description": "Another test event",
    "eventDate": "2026-03-26",
    "eventTime": "11:00:00",
    "location": "Another Location",
    "organizerName": "Another Organizer",
    "status": "upcoming",
    "slug": "test-event-gallery"
  }')

if [ "$duplicate_response" = "409" ]; then
    print_result 0 "Duplicate slug correctly rejected with 409"
else
    print_result 1 "Duplicate slug handling failed: got $duplicate_response instead of 409"
fi

echo -e "\n${YELLOW}7. Testing galleryJson field (JSON string)${NC}"
json_response=$(curl -s -w "%{http_code}" -o /tmp/json_response.json \
  -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "JSON Gallery Test",
    "description": "Testing JSON gallery field",
    "eventDate": "2026-03-27",
    "eventTime": "12:00:00",
    "location": "JSON Location",
    "organizerName": "JSON Organizer",
    "status": "upcoming",
    "galleryJson": "[\"uploads/events/json1.jpg\", \"uploads/events/json2.jpg\"]"
  }')

if [ "$json_response" = "201" ]; then
    print_result 0 "Event created with galleryJson field"
    json_gallery_count=$(cat /tmp/json_response.json | jq -r '.data.galleryImages | length')
    if [ "$json_gallery_count" = "2" ]; then
        print_result 0 "galleryJson field parsed correctly (2 images)"
    else
        print_result 1 "galleryJson parsing failed: expected 2, got $json_gallery_count"
    fi
else
    print_result 1 "galleryJson test failed with status $json_response"
fi

# Cleanup
rm -f /tmp/response.json /tmp/create_response.json /tmp/get_response.json /tmp/slug_response.json /tmp/update_response.json /tmp/duplicate_response.json /tmp/json_response.json

echo -e "\n${GREEN}🎉 Event API Tests Complete!${NC}"
echo "================================"
echo "Check the results above to verify all fixes are working."

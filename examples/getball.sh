#!/usr/bin/env bash
curl "https://apifootball.com/api/?action=get_events&from=2018-07-15&to=2018-07-16&APIkey=edbf3048c4db777ee0317d2c23aefecfd991356c41d510628e7b09ea37a65e7f" | grep "match_live\":\"1"

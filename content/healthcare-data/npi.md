---
layout: npi
title: 'National Provider Identifier Standard (NPI)'
description:
  'REST API and Monthly Archives of Healthcare Providers and NPI numbers'
canonical: https://adambcomer.com/blog/chess-analysis/
---

## REST API

Access NPI Provider data via a HTTP based REST API. Data for this API comes from
[monthly archives of NPI Provider information](https://download.cms.gov/nppes/NPI_Files.html)
by Centers for Medicare & Medicaid Services (CMS).

These archives are available to download below if you wish to host your own.
Alternatively, this API provides a simple, ergonomic way to access this large
corpus of information without needing to process the entire archive.

### Features

- No Authentication/Authorization need to access
- CORS enabled for all origins
- Cached and proxied through Cloudflare CDN for great performance

### Request Schema

Replace `{NPI_NUMBER}` with a Provider's NPI number.

```plaintext
https://npi-healthcare-data.adambcomer.com/npis/{NPI_NUMBER}
```

### Example Request

This example API request uses `curl` and [`jq`](https://jqlang.github.io/jq/) to
demonstrates how to access NPI Provider data from CMS archives by their NPI
number.

```bash-session
$ curl -sSf https://npi-healthcare-data.adambcomer.com/npis/1508869488 | jq
```

### Example Response

```json
{
  "successful": true,
  "provider": {
    "npi": 1508869488,
    "entity_type_code": 1,
    "replacement_npi": null,
    "ein": null,
    "organization_name": null,
    "other_organization_name": null,
    "other_organization_name_type_code": null,
    "credential_text": "PH.D.",
    "name": {
      "last_name": "HETHERINGTON",
      "first_name": "JOHN",
      "middle_name": "J",
      "name_prefix_text": "DR.",
      "name_suffix_text": null
    },
    "other_name": {
      "last_name": null,
      "first_name": null,
      "middle_name": null,
      "name_prefix_text": null,
      "name_suffix_text": null,
      "last_name_type_code": null
    },
    "mailing_address": {
      "first_line": "177 W COTTONWOOD LN",
      "second_line": "STE 7",
      "city_name": "CASA GRANDE",
      "state_name": "AZ",
      "postal_code": "852222552",
      "country_code": "US",
      "telephone_number": "5208364618",
      "fax_number": "5208362650"
    },
    "practice_location_address": {
      "first_line": "177 W COTTONWOOD LN",
      "second_line": "STE 7",
      "city_name": "CASA GRANDE",
      "state_name": "AZ",
      "postal_code": "852222552",
      "country_code": "US",
      "telephone_number": "5208364618",
      "fax_number": "5208362650"
    },
    "enumeration_date": "05/24/2005",
    "last_update_date": "07/08/2007",
    "npi_deactivation": {
      "deactivation_reason_code": null,
      "deactivation_date": "03/16/2006",
      "reactivation_date": "03/27/2006"
    },
    "gender_code": "M",
    "authorized_official": {
      "last_name": null,
      "first_name": null,
      "middle_name": null,
      "name_prefix_text": null,
      "name_suffix_text": null,
      "title_or_position": null,
      "telephone_number": null,
      "credential_text": null
    },
    "is_sole_proprietor": "X",
    "parent_organization": {
      "is_organization_subpart": null,
      "parent_organization_lbn": null,
      "parent_organization_tin": null
    },
    "certification_date": null,
    "licenses": [
      {
        "license_number": "DA4090",
        "license_number_state_code": "AZ"
      }
    ],
    "taxonomies": [
      {
        "taxonomy_code": "231H00000X",
        "primary_taxonomy_switch": "Y",
        "taxonomy_group": null
      }
    ],
    "other_identifiers": [
      {
        "identifier": "AZOO76260",
        "identifier_type_code": 1,
        "identifier_state": "AZ",
        "identifier_issuer": "BLUE CROSS/BLUE SHIELD"
      },
      {
        "identifier": "133376",
        "identifier_type_code": 1,
        "identifier_state": "WA",
        "identifier_issuer": "DEPT OF LABOR & INDUSTRIE"
      },
      {
        "identifier": "1Z2179",
        "identifier_type_code": 1,
        "identifier_state": "AZ",
        "identifier_issuer": "HEALTHNET"
      },
      {
        "identifier": "802117",
        "identifier_type_code": 5,
        "identifier_state": "AZ",
        "identifier_issuer": null
      }
    ]
  }
}
```

## Archives

Download and decompress the latest SQLite formatted archive of NPI Provider data
from CMS. Archives are compressed using
[zstd](https://facebook.github.io/zstd/).

```bash-session
$ curl --proto '=https' -sSf https://healthcare-data.adambcomer.com/npi/npi_data_july_2023.sqlite.zst | zstd -d - -o npi_data_july_2023.sqlite
```

### Archives List

- [July 2023 SQLite Database (npi_data_july_2023.sqlite.zst) [738.06 MB]](https://healthcare-data.adambcomer.com/npi/npi_data_july_2023.sqlite.zst)
- [June 2023 SQLite Database (npi_data_june_2023.sqlite.zst) [733.77 MB]](https://healthcare-data.adambcomer.com/npi/npi_data_june_2023.sqlite.zst)
- [May 2023 SQLite Database (npi_data_may_2023.sqlite.zst) [695.42 MB]](https://healthcare-data.adambcomer.com/npi/npi_data_may_2023.sqlite.zst)
- [April 2023 SQLite Database (npi_data_april_2023.sqlite.zst) [758.87 MB]](https://healthcare-data.adambcomer.com/npi/npi_data_april_2023.sqlite.zst)

### Documentation

The Centers for Medicare & Medicaid Services (CMS) publishes a
[monthly archive of all recognized providers and their associated NPI number](https://download.cms.gov/nppes/NPI_Files.html).
This data is invaluable because it enables downstream services to consistency
reference healthcare providers.

While publicly available, the data is cumbersome and challenging to process on
resource constrained computers. The primary use case of a NPI dataset is to
lookup provider information base on their NPI number. But, since the data lives
in a ~10GB CSV file, this makes searching next to impossible.

To make searches and point queries possible on modest hardware, I formatted the
data into SQLite tables. SQLite tables give us the benefits of fast indexes,
table joins, and stable datatypes.

```sql
TABLE providers (
    npi INTEGER PRIMARY KEY,
    entity_type_code INTEGER,
    replacement_npi INTEGER,
    ein TEXT,
    provider_organization_name TEXT,
    provider_last_name TEXT,
    provider_first_name TEXT,
    provider_middle_name TEXT,
    provider_name_prefix_text TEXT,
    provider_name_suffix_text TEXT,
    provider_credential_text TEXT,
    provider_other_organization_name TEXT,
    provider_other_organization_name_type_code TEXT,
    provider_other_last_name TEXT,
    provider_other_first_name TEXT,
    provider_other_middle_name TEXT,
    provider_other_name_prefix_text TEXT,
    provider_other_name_suffix_text TEXT,
    provider_other_credential_text TEXT,
    provider_other_last_name_type_code INTEGER,
    provider_first_line_business_mailing_address TEXT,
    provider_second_line_business_mailing_address TEXT,
    provider_business_mailing_address_city_name TEXT,
    provider_business_mailing_address_state_name TEXT,
    provider_business_mailing_address_postal_code TEXT,
    provider_business_mailing_address_country_code TEXT,
    provider_business_mailing_address_telephone_number TEXT,
    provider_business_mailing_address_fax_number TEXT,
    provider_first_line_business_practice_location_address TEXT,
    provider_second_line_business_practice_location_address TEXT,
    provider_business_practice_location_address_city_name TEXT,
    provider_business_practice_location_address_state_name TEXT,
    provider_business_practice_location_address_postal_code TEXT,
    provider_business_practice_location_address_country_code TEXT,
    provider_business_practice_location_address_telephone_number TEXT,
    provider_business_practice_location_address_fax_number TEXT,
    provider_enumeration_date TEXT,
    last_update_date TEXT,
    npi_deactivation_reason_code TEXT,
    npi_deactivation_date TEXT,
    npi_reactivation_date TEXT,
    provider_gender_code TEXT,
    authorized_official_last_name TEXT,
    authorized_official_first_name TEXT,
    authorized_official_middle_name TEXT,
    authorized_official_title_or_position TEXT,
    authorized_official_telephone_number TEXT,
    is_sole_proprietor TEXT,
    is_organization_subpart TEXT,
    parent_organization_lbn TEXT,
    parent_organization_tin TEXT,
    authorized_official_name_prefix_text TEXT,
    authorized_official_name_suffix_text TEXT,
    authorized_official_credential_text TEXT,
    certification_date TEXT
);

TABLE provider_licences (
    npi INTEGER,
    provider_license_number TEXT,
    provider_license_number_state_code TEXT
);

TABLE provider_taxonomies (
    npi INTEGER,
    healthcare_provider_taxonomy_code TEXT,
    healthcare_provider_taxonomy_group TEXT,
    healthcare_provider_primary_taxonomy_switch TEXT
);

TABLE other_provider_identifiers (
    npi INTEGER,
    other_provider_identifier TEXT,
    other_provider_identifier_type_code INTEGER,
    other_provider_identifier_state TEXT,
    other_provider_identifier_issuer TEXT
);
```

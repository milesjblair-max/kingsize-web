variable "cloudflare_api_token" {
  description = "The Cloudflare API token used to authenticate."
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "The Zone ID of your domain on Cloudflare."
  type        = string
}

variable "domain_name" {
  description = "The APEX domain name (e.g., example.com)."
  type        = string
}

variable "cloudflare_account_id" {
  description = "The Cloudflare Account ID."
  type        = string
}

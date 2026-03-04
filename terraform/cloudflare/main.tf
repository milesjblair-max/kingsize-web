# ==============================================================
# Cloudflare CDN Architecture for Headless E-Commerce
# ==============================================================

# 1. Networking & Optimization
resource "cloudflare_zone_settings_override" "main_settings" {
  zone_id = var.cloudflare_zone_id

  settings {
    ssl                      = "strict"
    always_use_https         = "on"
    brotli                   = "on"
    early_hints              = "on"
    mirage                   = "off"
    polish                   = "lossless"
    min_tls_version          = "1.2"
    # Note: Argo Smart Routing & Tiered Caching are often enabled at the account 
    # level or require specific subscriptions. Basic settings are applied here.
  }
}

# 2. Modern Cache Rules
# Rule 1: Bypass Cache for Active Sessions, Carts, and Admins
resource "cloudflare_ruleset" "cache_bypass_sessions" {
  zone_id     = var.cloudflare_zone_id
  name        = "Bypass Cache for Sessions"
  description = "Bypass cache when ks_* cookies are present"
  kind        = "zone"
  phase       = "http_request_cache_settings"

  rules {
    action = "set_cache_settings"
    action_parameters {
      cache = false
    }
    expression  = "(http.request.cookies[\"__Host-ks_session\"][0] != \"\" or http.request.cookies[\"ks_logged_in\"][0] != \"\" or http.request.cookies[\"ks_cart_token\"][0] != \"\" or http.request.cookies[\"__Host-ks_admin_session\"][0] != \"\")"
    description = "Bypass for active sessions"
    enabled     = true
  }
}

# Rule 2: Aggressive caching for static assets
resource "cloudflare_ruleset" "cache_static_assets" {
  zone_id     = var.cloudflare_zone_id
  name        = "Cache Static Assets"
  description = "Aggressive caching for static files"
  kind        = "zone"
  phase       = "http_request_cache_settings"

  rules {
    action = "set_cache_settings"
    action_parameters {
      cache = true
      edge_ttl {
        mode    = "override_origin"
        default = 2592000 # 1 month
      }
      browser_ttl {
        mode    = "override_origin"
        default = 31536000 # 1 year
      }
    }
    expression  = "(http.request.uri.path.extension in {\"css\" \"js\" \"jpg\" \"jpeg\" \"png\" \"webp\" \"avif\" \"svg\" \"woff2\"})"
    description = "Cache static assets"
    enabled     = true
  }
}

# 3. Security Posture (Rate Limiting & WAF)
resource "cloudflare_ruleset" "rate_limiting_login" {
  zone_id     = var.cloudflare_zone_id
  name        = "Rate Limit Login"
  description = "Protect against credential stuffing"
  kind        = "zone"
  phase       = "http_ratelimit"

  rules {
    action = "block"
    ratelimit {
      characteristics = ["ip.src"]
      period          = 60
      requests_per_period = 5
      mitigation_timeout = 300
    }
    expression  = "(http.request.uri.path contains \"/login\" or http.request.uri.path contains \"/api/auth\")"
    description = "Block excessive login attempts"
    enabled     = true
  }
}

resource "cloudflare_ruleset" "rate_limiting_checkout" {
  zone_id     = var.cloudflare_zone_id
  name        = "Rate Limit Checkout"
  description = "Protect against checkout/carding abuse"
  kind        = "zone"
  phase       = "http_ratelimit"

  rules {
    action = "managed_challenge"
    ratelimit {
      characteristics = ["ip.src"]
      period          = 60
      requests_per_period = 10
      mitigation_timeout = 300
    }
    expression  = "(http.request.uri.path contains \"/checkout\" or http.request.uri.path contains \"/api/payment\")"
    description = "Challenge excessive checkout attempts (Turnstile)"
    enabled     = true
  }
}

# 4. Privacy Edge Worker (Headers & Query Cleaning)
resource "cloudflare_worker_script" "privacy_geo_worker" {
  account_id = var.cloudflare_account_id
  name       = "ks-privacy-geo-worker"
  content    = file("${path.module}/worker.ts")
  module     = true
}

resource "cloudflare_worker_route" "privacy_worker_route" {
  zone_id     = var.cloudflare_zone_id
  pattern     = "${var.domain_name}/*"
  script_name = cloudflare_worker_script.privacy_geo_worker.name
}

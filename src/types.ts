export interface FilterOption {
  field: string
  type: "text" | "number" | "date" | "boolean" | "array" | "json"
  operators: string[]
  data_type: string
}

export interface Filter {
  field: string
  operator: string
  value: string | boolean | number | Array<string | number>
}

export interface FilterRequest {
  filters: Filter[]
  sort_by?: string
  sort_order?: "asc" | "desc"
  limit?: number
  offset?: number
}

export interface ValidationError {
  loc: Array<string | number>
  msg: string
  type: string
}

export interface HTTPValidationError {
  detail: ValidationError[]
}

export interface Profile {
  id?: string
  username?: string
  full_name?: string
  biography?: string
  profile_pic_url?: string
  followed_by_count?: number
  follow_count?: number
  posts_count?: number
  is_verified?: boolean
  update_time?: string
  create_time?: string
  instagram_id?: string
  business_address_json?: Record<string, unknown>
  business_category_name?: string
  business_contact_method?: string
  business_email?: string
  business_phone_number?: string
  category_enum?: string
  category_name?: string
  connected_fb_page?: string
  country_block?: boolean
  eimu_id?: string
  external_url?: string
  fbid?: string
  has_clips?: boolean
  has_guides?: boolean
  has_onboarded_to_text_post_app?: boolean
  hide_like_and_view_counts?: boolean
  highlight_reel_count?: number
  is_business_account?: boolean
  is_embeds_disabled?: boolean
  is_joined_recently?: boolean
  is_private?: boolean
  is_professional_account?: boolean
  is_regulated_c18?: boolean
  is_supervision_enabled?: boolean
  pronouns?: string
  should_show_category?: boolean
  should_show_public_contacts?: boolean
  show_account_transparency_details?: boolean
  show_text_post_app_badge?: boolean
  transparency_label?: string
  transparency_product?: string
  remarks?: string
  bio_links?: string[]
  hashtags?: string[]
  related_profiles?: string[]
  igtv_videos_count?: number
  tag?: string
}

export interface Post {
  shortcode: string
  type_name?: string
  accessibility_caption?: string[]
  coauthor_producers?: string[]
  comments_disabled?: boolean
  height?: number
  width?: number
  display_url?: string[]
  liked_by?: number
  preview_like?: number
  caption?: string[]
  comment_count?: number
  tagged_users?: string[]
  has_audio?: boolean
  is_video?: boolean
  like_and_view_counts_disabled?: boolean
  location?: string
  pinned_for_users?: string[]
  product_type?: string
  posted_at?: number
  thumbnail_src?: string
  title?: string
  video_url?: string[]
  video_views?: number[]
  clips_music_attribution_info_artist_name?: string
  clips_music_attribution_info_song_name?: string
  is_published?: boolean
  video_duration?: number
  create_time?: string
  update_time?: string
  profile_id?: number
}
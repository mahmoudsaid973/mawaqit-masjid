# PR-30 — ProGuard rules for Compose + Retrofit + Kotlinx-Serialization.

# Compose
-dontwarn androidx.compose.**
-keep class androidx.compose.runtime.** { *; }

# Retrofit + OkHttp
-dontwarn retrofit2.**
-keep class retrofit2.** { *; }
-keepattributes Signature, InnerClasses, EnclosingMethod
-keepattributes RuntimeVisibleAnnotations, RuntimeVisibleParameterAnnotations

# Kotlinx Serialization
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.**
-keepclassmembers class kotlinx.serialization.json.** { *; }
-keepclasseswithmembers class **$$serializer { *; }

# Hilt
-dontwarn dagger.hilt.**
-keep class * extends dagger.hilt.android.internal.modules.ApplicationContextModule { *; }

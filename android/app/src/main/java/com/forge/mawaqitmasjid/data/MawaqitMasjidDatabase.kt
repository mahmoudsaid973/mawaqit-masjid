// PR-102 — Room database module.
package com.forge.mawaqitmasjid.data

import androidx.room.Database
import androidx.room.RoomDatabase

@Database(
    entities = [],
    version = 1,
    exportSchema = false,
)
abstract class MawaqitMasjidDatabase : RoomDatabase() {
    // Per-feature DAOs are declared here as features are scaffolded:
    //   abstract fun userDao(): UserDao
}

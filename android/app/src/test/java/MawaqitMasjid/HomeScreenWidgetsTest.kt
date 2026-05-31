// Wave15.4: stripped 2 lines of leading LLM narration prose
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.assertIsDisplayed
import MawaqitMasjid.ui.screens.HomeScreenWidgetsScreen
import org.junit.Rule
import org.junit.Test

/**
 * JUnit tests for the Home Screen Widgets feature using Jetpack Compose Testing.
 * Covers happy path rendering, empty state verification, and boundary cases.
 */
class HomeScreenWidgetsTest {

    @get:Rule
    val composeTestRule = createComposeRule()

    /**
     * Happy Path: Verifies that the Home Screen Widgets screen loads
     * and displays the main title correctly.
     */
    @Test
    fun testHomeScreenWidgets_displaysTitle() {
        composeTestRule.setContent {
            HomeScreenWidgetsScreen()
        }

        composeTestRule
            .onNodeWithText("Home Screen Widgets")
            .assertIsDisplayed()
    }

    /**
     * Empty State Path: Verifies that the screen displays the appropriate
     * message when no widgets are configured.
     */
    @Test
    fun testHomeScreenWidgets_displaysEmptyStateMessage() {
        composeTestRule.setContent {
            HomeScreenWidgetsScreen()
        }

        composeTestRule
            .onNodeWithText("No widgets configured yet.")
            .assertIsDisplayed()
    }

    /**
     * Boundary Case: Verifies layout stability when the screen is rendered
     * with default parameters (minimal modifier).
     */
    @Test
    fun testHomeScreenWidgets_rendersWithDefaultModifier() {
        composeTestRule.setContent {
            HomeScreenWidgetsScreen()
        }

        // Assert that the main content exists and is displayed
        composeTestRule
            .onNodeWithText("Home Screen Widgets")
            .assertExists()
            .assertIsDisplayed()
    }
}

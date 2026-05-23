from pydantic import BaseModel, Field


class MetricsResponse(BaseModel):
    """Aggregated analytics computed from live participant data."""

    total_participants: int = Field(..., description="Total number of enrolled participants")

    # Status breakdown
    active_count: int = Field(..., description="Participants currently active in the trial")
    completed_count: int = Field(..., description="Participants who completed the trial")
    withdrawn_count: int = Field(..., description="Participants who withdrew from the trial")

    # Study group breakdown
    treatment_count: int = Field(..., description="Participants in the treatment arm")
    control_count: int = Field(..., description="Participants in the control arm")

    # Gender breakdown
    male_count: int = Field(..., description="Male participants")
    female_count: int = Field(..., description="Female participants")
    other_gender_count: int = Field(..., description="Participants with gender 'Other'")

    # Derived rates (percentages)
    retention_rate: float = Field(
        ..., description="Percentage of non-withdrawn participants (0-100)"
    )
    completion_rate: float = Field(
        ..., description="Percentage of completed participants (0-100)"
    )

    # Age statistics
    avg_age: float = Field(..., description="Average age across all participants")
